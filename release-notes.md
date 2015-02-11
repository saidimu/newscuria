# Release Notes

## Development

[Commits](https://github.com/saidimu/newscuria/compare/v0.2.0...master)

## v0.2.0 - February 10th, 2015
- [#12](https://github.com/saidimu/newscuria/issues/12) - Add cassandra-tools package to Cassandra docker image ([@saidimu](https://api.github.com/users/saidimu))
- [#9](https://github.com/saidimu/newscuria/pull/9) - Fixes for message queue issues (disconnections, backlogs, etc) ([@saidimu](https://api.github.com/users/saidimu))
- [#6](https://github.com/saidimu/newscuria/pull/6) - Merging 'dev' branch ([@saidimu](https://api.github.com/users/saidimu))
- [#5](https://github.com/saidimu/newscuria/issues/5) - Rename nsqd channels to describe actions on messages ([@saidimu](https://api.github.com/users/saidimu))
- [#2](https://github.com/saidimu/newscuria/pull/2) - Basic "load article in browser" to "see entities in chrome extension" work. ([@saidimu](https://api.github.com/users/saidimu))
- [#1](https://github.com/saidimu/newscuria/pull/1) - Initial working code ([@saidimu](https://api.github.com/users/saidimu))
- [#10](https://github.com/saidimu/newscuria/issues/10) - Enable use of multiple NSQ daemons
- [#3](https://github.com/saidimu/newscuria/issues/3) - Increase nginx request size limits
- Augmenented logger with app-specific logging message "types" - 99f373f
- Changed logging destination to from Papertrail to Loggly.com. - d4e32b4
- Refactored away global queue.js and mixpanel.js modules. - d683177
- (probably) fixed require() order b/w queue.js and mixpanel.js - 74b5cad
- Added mixpanel package and started instrumenting modules. - 552f3c9
- Added CircleCI config file. Temporarily removed rate-limiting until I find a more robust way of handling it. - ae81f81
- Fixed bug with improper checking of NLP object types (array membership testing) - 0042daa
- Removed #ephemeral topics. Not certain of their utility at present. - d24212f
- Moved queue message.finish() after processing of entities. - bde9328
- workaround 'config' bug regarding multiple confg files - f83b369
- Disabled CartoDB integration to rethink it further. - 53985e2
- Completed refactor of NLP 'object' extraction and publishing of finer-grained NLP objects. - 7c9fdf0
- Fleshing out interactions between high-level YAML definitions (people,places,things,events, etc) and lower-level Opencalais definitions (entities,relations,topics etc) - 26343ce
- Added YAML definitions to help in extracting entities, events, things, topics, tags, etc etc in a dynamic and flexible way without changing code. Also allows for expansion of the definitions or re-arranging of the extracted 'groupings' - 77a7927
- Added more allowed topics to the queue library - 9042ef6
- Removed newrelic from main.js b/c it seems to be interferring with message processing. In the other apps, move require('newrelic') to after 'use strict' to see if it fixes lack of data reporting. - c422605
- Added a main.js file to consolidate most of the currently separate NodeJS apps. Started process of moving separate apps into main.js - 5d33a1d
- Parametrized app_name to use env vars. - 126c0ba
- Switched to using cartodb-nodejs instead of homegrown requests-based code. Also moved API key to a private config file (and revoked accidentally posted key). - a960eb3
- Refactored-out entities processing to its own module. Added CartoDB processing as a new module. - 7d2b339
- Tiny miscellaneous bug fixes. - 835c6f0
- Added Cassandra schema. - 17b6132
- Fixed bug on accessing a websocket client property as a function - 0fc1f64
- Added websocket client id and request-headers logging upon disconnection. - 6d4ed97
- Minor cleanup of unused requires. Also added guard against undefined callbacks. - 3c77fce
- Added a global error handler to print error message and stack trace before exiting cleanly. Process restarts are handled externally (in this case by Docker). - 256c5be
- Bumped-up socketio version. Added console.log to troubleshoot non-working logging library. - 3d95e26

Compatibility notes:
- TODO : What might have broken?

[Commits](https://github.com/saidimu/newscuria/compare/a4f88e2...v0.2.0)
