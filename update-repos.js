const Github = require('github-api');
const Git = require('simple-git');
const git = Git('..');
const async = require('async');
const fs = require('file-system');

/****************************************************
 *                 DEFINITIONS                      *
 ****************************************************/

/**
 * Deletes a directory recursively, meaning it first deletes all content and afterwards the directory itself.
 * Works also on pure files.
 * @param path Path to the directory to be deleted.
 */
function deleteRecursive(path) {
    if (fs.existsSync(path)) {
        const parentStat = fs.statSync(path);
        if (parentStat.isDirectory()) {
            const files = fs.readdirSync(path);
            files.forEach(function (file) {
                const curPath = path + "/" + file;
                const childStat = fs.statSync(curPath);
                if (childStat.isDirectory()) { // recurse
                    deleteRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        } else {
            fs.unlinkSync(path);
        }
    }
}

/**
 * Copy the content of a directory into another directory.
 * It only replaces files in {@code targetRoot} and does not delete any other files.
 * Preferred way to be called via {@see mergeDirs}.
 * @param sourceDir Directory whose content should be copied
 * @param targetRoot Directory that should contain the content of {@code sourceDir}
 */
function copyDir(sourceDir, targetRoot) {
    const sourceFiles = fs.readdirSync(sourceDir);
    for (const file of sourceFiles) {
        const sourceStat = fs.statSync(`${sourceDir}/${file}`);
        if (sourceStat.isDirectory()) {
            if (!fs.existsSync(`${targetRoot}/${file}`) || !fs.statSync(`${targetRoot}/${file}`).isDirectory()) {
                fs.mkdirSync(`${targetRoot}/${file}`);
            }
            copyDir(`${sourceDir}/${file}`, `${targetRoot}/${file}`)
        } else {
            fs.copyFileSync(`${sourceDir}/${file}`, `${targetRoot}/${file}`);
        }
    }
}

/**
 * Wrapper for {@link copyDir} to check if both parameters are directories.
 * @param source Source of the content
 * @param target Should contain the content afterwards
 */
function mergeDirs(source, target) {
    if (!fs.statSync(source).isDirectory() || !fs.statSync(target).isDirectory()) {
        console.error(`mergeDirs: source "${source}" and target "${target}" have to be directories!`);
        return;
    }
    copyDir(source, target);
}

/**
 * Method for creating a PR.
 * @param repoName name of the repository in the format owner/repo
 * @param cb callback
 */
function makePr(repoName, cb) {
    const repo = gh.getRepo(getRepo(repoName));
    repo.listPullRequests({state:'open'}).then(function (prs) {
        if (prs.filter(pr => pr.title !== 'Update of Ultimate-Comparison-BASE' &&
                pr.user.login !== 'ultimate-comparison-genie').length !== 0) {
            repo.createPullRequest({
                title: 'Update of Ultimate-Comparison-BASE',
                head: 'travis-update',
                base: 'master',
                body: 'This is PR was automatically created because Ultimate-Comparisons-BASE was updated.\n' +
                'Pease incorporate this PR into this comparison.',
                maintainer_can_modify: true
            }).then(function () {
                console.log(`Made PR for ${repoName}`);
                cb();
            }).catch(function (error) {
                console.error(error);
            });
        } else {
            console.log('PR already open and thus no creation needed')
        }
    });
}

/**
 * Reform current branch to update branch
 * @param gt reference to git repo with simple-git.Git
 * @param repoName full name of the repo, meaning 'owner/repo'
 * @param cb callback
 */
function makeUpdate(gt, repoName, cb) {
    const path = gt._baseDir;
    const ignores = [
        'comparison-configuration',
        'comparison-elements',
        'README.md',
        'README-THING.template.md',
        '.travis.yml',
        'id_rsa.enc',
        'LICENSE',
        'citation/acm-siggraph.csl',
        'citation/default.bib'
    ];
    for (const ignore of ignores) {
        try {
            deleteRecursive(`${path}/${ignore}`);
        } catch (error) {
            console.error(error);
        }
    }

    ignores.push('.git');

    fs.readdirSync('.').filter(f => ignores.indexOf(f) === -1).forEach(file => {
        try {
            if (fs.statSync(file).isDirectory()) {
                mergeDirs(file, path);
            } else {
                fs.createReadStream(file).pipe(fs.createWriteStream(`${path}/${file}`));
            }
        } catch (error) {
            console.error(error);
        }
    });

    gt.add(path).then(function () {
        gt.commit('Travis commit for travis-update').then(function () {
            gt.push('origin', 'travis-update').then(function () {
                console.log(`Pushed for ${gt._baseDir}`);
                makePr(repoName, cb);
                deleteRecursive(path);
            });
        });
    });
}

/****************************************************
 *                 SCRIPT START                     *
 ****************************************************/

if (process.argv.length <= 2) {
    console.error('Usage: node update-repos.js API_TOKEN');
    process.exit(1)
}
const apiToken = process.argv[2];

const gh = new Github({
    token: apiToken
});
console.log('gh created')
const uc = gh.getOrganization('ultimate-comparisons-test');
uc.getRepos().then(rs => {
    console.log('got repos')
    const repos = rs.data
        .map(r => { return { fullname: r.full_name, name: r.full_name.split('/')[1]}; })
        .filter(r => r.name !== 'ultimate-comparison-BASE' && !r.name.endsWith('.io'));

    console.log("Repos in the organization: " + JSON.stringify(repos));

    async.eachOf(repos, function (repo, index, cb) {
        console.log(`iterate ${repo.fullname}`);
        git.clone(`git@github.com:${repo.fullname}.git`, function () {
            console.log(fs.readdirSync('.'));
            const gt = Git(repo.name);
            gt.addConfig('user.email', 'hueneburg.armin@gmail.com').then(function() {
                gt.addConfig('user.name', 'Armin Hüneburg').then(function() {
                    gt.branch(function (err, branches) {
                        if (err) {
                            console.error(err);
                        }
                        if (Object.keys(branches.branches).indexOf('travis-update') === -1) {
                            gt.checkoutLocalBranch('travis-update', function () {
                                makeUpdate(gt, repo.fullname, cb);
                            });
                        } else {
                            gt.checkout('travis-update', function () {
                                makeUpdate(gt, repo.fullname, cb);
                            });
                        }
                    });
                });
            });
        });
    }, function (err) {
        if (err) {
            console.error(err);
        }

        const foreignRepos = fs.readFileSync('repos-to-update.list', {encoding: 'utf8'})
            .split('\n')
            .map(e => e.trim())
            .filter(e => !e.startsWith('#') && e.length > 0)
            .map(e => { return {fullname: e, name: e.split('/')[1]}; });

        async.eachOf(foreignRepos, function (repo, index, cb) {
            git.clone(`git@github.com:${repo.fullname}.git`, function () {
                const gt = Git(repo.name);
                gt.branch(function (err, branches) {
                    if (err) {
                        console.error(err);
                    }
                    if (branches.branches.keys().indexOf('travis-update') === -1) {
                        gt.checkoutLocalBranch('travis-update', function () {
                            makeUpdate(gt, repo.fullname, cb);
                        });
                    } else {
                        gt.checkout('travis-update', function () {
                            makeUpdate(gt, repo.fullname, cb);
                        });
                    }
                })
            });
        }, function (err) {
            if (err) {
                console.error(err);
            }
        });
    });
}).catch(err => {
    console.error(err);
    process.exit(2);
});
