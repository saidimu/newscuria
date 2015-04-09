# Release Notes

## Development

[Commits](https://github.com/saidimu/newscuria/compare/v0.3.0...master)

## v0.3.0 - April 9th, 2015
- [#36](https://github.com/saidimu/newscuria/issues/36) - Enable Cassandra metrics reporting to InfluxDB/Grafana ([@saidimu](https://api.github.com/users/saidimu))
- Renamed metric-type names for greater clarity. - d45ec78
- Removed stray object reference. - ef3d648
- Modified metrics writing to bulk submit metrics and dynamically figure out series name and values. - 2708e77
- Re-added metrics-to-influxdb sending code - c4fe2a5
- Refactored twitter.js instrumentation - 6588b89
- Refactored search.js instrumentation - 0a9b8a4
- Refactored entities.js instrumentation - 5e2ae73
- Refactored datastore.js instrumentation - 6925192
- Refactored opencalais.js instrumentation - 43c7d6e
- Added a util 'urls' library. Refactored instrumentation in readability.js - b6b9458
- Renamed log.types into metrics.types. Also centralized rate-limit logging into rate-limiting module. - 4146d7b
- Added mandatory metadata to metrics collection - e69463c
- Refactored metrics calls and renamed modules. - 18db1ac
- Fixed incorrect stats dump call. - cbcd2ae
- Converted old metrics.store into metrics.histogram with a console.log at defined intervals - 3302ffc
- Added instrumentation types and wrapper module. - 94755fb
- Added metrics storing to InfluxDB. - 5f5de02
- Added metrics storing to InfluxDB. - 060b70d
- Exposed InfluxDB client in metrics.js - 32188c5
- round up to nearest second to prevent errors with upstream systems that cannot deal with floats - 694eff2
- Modified amount of time rate-limited clients sleep due to insufficient tokens from limitd. - c99503e
- Added metrics storing to InfluxDB. - b216f74
- Added metrics storing to InfluxDB. - 1cf2e7b
- Parametrized Loggly enable/disable - 14d368c
- Temporary disabling of Loggly.com b/c constantly busting Loggly's limits - 6a08238
- Added config flag to activate/deactivate metrics collection. - 41197eb
- Added timeout to metrics store request. - 749d0af
- Added InfluxDB metrics collection. - 2a82c10
- Further reduction in log size/verbosity in queue.js errors (removed NSQ 'message' field) - fc7bd56
- Fixed uncaught nsq Writer error. Also reduced size of logs from entities.js (removed url field) - f60d0d5
- Switched FROM custom java+others to official Docker Oracle-JRE image - 422b0fa
- Switched FROM custom nodejs+others to official Docker nodejs image - 8326069
- Rounding up message sleeping into ints cuz nsqjs seems to barf on floats. - 62f5137
- Fixed comment in JSON object - 8dd477d
- Re-enable mistakenly disabled twitter.js (no need for disabling in code since that is controlled by a config file) - 23e1d82
- Refactored to new ratelimiter 'limitd' - 614dcee
- Refactored to new ratelimiter 'limitd' - 5d84a2b
- Refactored to new ratelimiter 'limitd' - 7a123ab
- Refactored to new ratelimiter 'limitd' - 2846e36
- Refactored to new ratelimiter 'limitd' - c2a189b
- Now requeueing with backoff to prevent other messages from being pushed from the server. Initially was only requeing with no backoff. - 09dd362
- Reworked logic when rate-limited and given a seconds-to-sleep recommendation. - d6a0681
- Refactored filter.js to use limitd's rate-limiting - 7de2446
- Fixed syntax errors and minor bugs. - d6c5ada
- Reworked logic on tokens re-request if request size > max. size of bucket - c70d0c7
- Fixed bug in calculating sleep_duration (had switched operands) - 972f85a
- Improved 'take' function signature (changed to an object) - 83f7bae
- Added limitd wrapper and new log-types - 30fe823
- Disabled twitter streaming. - 49b0c4d
- Removed elasticsearch index mappings - a022d69
- Updated limitd to 4.1.2; Removed limitd.yml from repo - 9a41a57
- Updated package.json with limitd package and added example limitd.yml config file - de82163
- Modified default Loggly.com logs buffer to 100 messages - 84beedc
- Added on/off switch in config file to control twitter streaming module - f1bd4dd
- Switched NSQ Reader instances from connecting to NSQLookupd to directly connecting to NSQD due to 'socket hangup' errors when connecting to NSQLookupd at high load - 9c41828
- Revert "Temporarily disabled Nodetime.com profiling to investigate crashing errors." - 1cd930a
- Temporarily disabled Nodetime.com profiling to investigate crashing errors. - 5728e4b
- Added twitter streaming as another source of URLs. - 8da1318
- Added twitter streaming as another source of URLs. - 67e59e1
- Added FIXME. - 8af8205
- Re-enabled elasticsearch client logging after removing all debug statements. - a3cd518
- Reduced logging messages on rate-limiting. - 05303f1
- Temporarily disabled bunyan logger in elasticsearch client cuz it's too noisy. - 5117119
- Changed indexing function to avoid re-indexing document if it already exists. - 4c3302a
- Consolidated some logs in webhooks.js - c98392d
- Added bunyan log class to elasticsearch client - 54a3803
- Exposed more elasticsearch.js module options to config file - a4762d7
- Reduced the number of log messages to stay within free limits of logging service (Loggly.com) - 941e151
- Removed AppDynamics profiling. - 3f5875d
- Removed AppDynamics profiling. - 2cc8137
- Testing out a new profiler (AppDynamics.com). Also factored-out profiling init code. - 9462efa
- Reinstated rate-limiting but with more relaxed limits. - f181dbd
- Increased Node's default https maxSockets - e2f43e2
- Added buffering to Loggly logging. - bebb4c9
- Disabled rate-limiting while I investigate effects of changing http.global parameters. - fa51fcb
- Removed un-needed npm packages; removed Logentries.com logging (now only using Loggly) - ef6fcaa
- Increased Node's default http maxSockets - 7867b1a
- Added Nodejs profiling via NodeTime.com - 25d4484
- Fixed bug where queue messages weren't being finished() in case of url-missing errors in Opencalais objects. - 5ab78fd
- More robust config params fetching - 1085343
- Parametrized 'from' and 'until' periods. Now reads values from config file - 0b68ac2
- Parametrized 'from' and 'until' periods. Now reads values from config file - 7e35ece
- Removed 'from' and 'until' params from Ducksboard interface - 2cebd42
- Added facet_size param to Loggly API call - 7145213
- Logic bugfix. - 3f7f4f8
- Bugfix. - ace1c56
- Exposed Loggly API's from- and until- params to Ducksboard integration - 2ac83b9
- Fixed missing response headers. - a717502
- Improved logging and restify return codes. - f917f98
- Added experimental Ducksboard-Loggly integration. - eb97c0c
- Added experimental Ducksboard-Loggly integration. - 42ca952
- Added experimental Ducksboard-Loggly integration. - a84bcda
- Added experimental Ducksboard-Loggly integration. - a6e3a69
- Fixed bug with rate-limiting log message - 7bc0cb4
- Updated modules to implement rate-limiting - b68d10a
- Added safety-checks around non-existant config values - 01ca446
- Added new rate-limiting util library to make it easier to integrate rate-limiting to other modules. - 4ac243a
- Updated Elasticsearch mappings to avoid Opencalais-generated entity-event dates - 84f1571
- Logging Elasticsearch request body in case of an index error. - cc52a8f
- Changed 'date' mapping from default string to 'date' - c0771f3
- Fixed bug where NLP objects were being mistakenly published to multiple search indices. - da47604
- Added Elasticsearch type mappings. - ea8af19
- Added a composite 'geo_point' property to allow geo queries by Elasticsearch - ea19119
- Parametrized rate-limiter configuration - b3ae735
- Added rate-limiter and changed message.finish() calls to take into account success of indexing calls. - 8cd22a0
- Fixed bug: forgot to message.finish() queue messages - d447b2c
- Fixed bug to check for error response before logging error message. - ccca703
- Added elasticsearch indexing of NLP entities - c457ccd
- Renamed logging-types to log-types. - 84a8ef8
- Added date_published of parent Opencalais object to child NLP objects. Also expanded Opencalais categories in entities.yml file. - 3d81db4
- Added 'url' property to NLP object to associate it with its ancestors: Opencalais --> Readability --> original url - d766031
- Deleted erroneously-commited generator-release file. - 1e25c82
- Revert "Moved release notes to root folder." - 30394c4
- Moved release notes to root folder. - 6418a8e

Compatibility notes:

[Commits](https://github.com/saidimu/newscuria/compare/v0.2.0...v0.3.0)

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
