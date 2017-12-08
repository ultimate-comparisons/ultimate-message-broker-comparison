# Ultimate Message Broker Comparison

[![Build Status](https://travis-ci.org/ultimate-comparisons/ultimate-message-broker-comparisons.svg?branch=master)](https://travis-ci.org/ultimate-comparisons/ultimate-message-broker-comparison)

This is an ultimate comparison of message brokers.

## Test it
1. Install [node.js](https://nodejs.org/en/)
2. Intall [Java JDK8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
3. Install [pandoc](http://pandoc.org/installing.html) (Version 1.17.2) [pandoc-citeproc](https://hackage.haskell.org/package/pandoc-citeproc)
        
        wget https://github.com/jgm/pandoc/releases/download/1.17.2/pandoc-1.17.2-1-amd64.deb
        sudo dpkg -i pandoc-1.17.2-1-amd64.deb
        
4. Update npm (sudo): `npm install -g npm`
5. Test dependencies:

        java -version
        npm -version

6. `npm install`
7. `npm start` (starts the web page)
8. [Setup automatic deployment of `www` directory using Travis CI](https://github.com/ultimate-comparisons/ultimate-comparison-BASE/wiki/Build-and-deploy-project-with-Travis-CI)


## Ultimate-Message Broker-Comparison Element Specification
The code below shows a sample element.

    # Template - www.example.com

    ## Description
    _Description_

    ## Repo
    - _Repo url_

    ## License
    - Apache 2.0
    - BDS-3-Clause
    - EPL
    - LGPv3
    - MIT
    - MPL 1.1

    ## Protocols
    - AMQP
    - AUTO
    - Beanstalkd
    - Gearman
    - memcached
    - MQTT
    - OpenWire
    - RESP
    - STOMP
    - text
    - thrift
    - ZMTP

    ## Platforms
    - Linus
    - OSX
    - Windows

    ## Working examples
    - Yes
        - _Example_
    - No

    ## JMS support
    - Yes
    - No

    ## Broker Backend
    - HornetQ
    - RabbitMQ
    - Redis
    - None
     
    ## Google hits
    - _Number_

## License

The code is licensed under [MIT], the content (located at `comparison-elements`) under [CC-BY-SA-4.0].

  [MIT]: https://opensource.org/licenses/MIT
  [CC-BY-SA-4.0]: http://creativecommons.org/licenses/by-sa/4.0/

<hr />
