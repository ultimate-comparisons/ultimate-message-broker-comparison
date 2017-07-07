# Sidekiq - https://github.com/mperham/sidekiq
Simple, efficient background processing for Ruby.


## Description
Simple, efficient background processing for Ruby.

Sidekiq uses threads to handle many jobs at the same time in the same process. It does not require Rails but will integrate tightly with Rails to make background processing dead simple.

Sidekiq is compatible with Resque. It uses the exact same message format as Resque so it can integrate into an existing Resque processing farm. You can have Sidekiq and Resque run side-by-side at the same time and use the Resque client to enqueue jobs in Redis to be processed by Sidekiq.


## License
- LGPLv3
    - [@sidekiqLicense]


## Development status
- Active
    - Last version: 5.0.0 on 2017-04-25 [@sidekiqVersions]
- Stable


## Broker Backend
- Redis


## Working example
- Yes
    - https://github.com/mperham/sidekiq/wiki


## JMS support
- No


## Google hits
- 203.000


## Client language
- Ruby
