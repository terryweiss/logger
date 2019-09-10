__**CC Logger**__



[TOC]


# Intro
Effective logging is critical to system maintenance both from a debugging perspective and an infrastructuture management perspective. It is tempting to just log everything when reporting on your system and its performance, but a noisy log is worse than no log because it can lead you to places that are unrelated to what you are troubleshooting. Another problem are systems that are reliant on reusable libraries and components. Being able to control those component's logs can help a great deal by allowing you to see how those libraries respond to your calls.

This library attempts to solve those problems by defining a progressive filter that is applied to your logs at runtime. These can be accomodated from command line or from the environment or from a configuration file. It is based on [debug-logger](https://www.npmjs.com/package/debug-logger);

# Installation
```bash
npm install @terryweiss/logger
```
# Usage

```javascript
// Get a reference to the library
const {getLogger} = require("@terryweiss/logger");

// create a logger with a namespace. The namespce will be used to
// filter the log vertically at runtime and also serves to group
// related logs together
const logger = getLogger("myNameSpace");
// Write your log to the "info" channel. The channel serves to filter horizontally,
// recording types of information.
logger.info("I am a message!");
// -> myNameSpace:info: I am a message!
```

Et viola! You have logged. There are a few main concepts here. Let's look at them.

## Namespaces
Namespaces define a functional component and categorize its internam parts. The hierarchy is defined by `:` by convention, but not by rule. Here are some valid namespaces.
    - ccsql         - A pacakge
    - ccsql:request - A package that contains module (or process) called `request`
    - ccsql:connection  - A different module (or process) called `connection`

Now you want to run your system but look only output from `ccsql:request`.
```bash
# Linux
DEBUG=ccsql:request node index.js
```cmd
REM Windows
set DEBUG=ccsql:request & node index.js
```
To show all modules (or processes) run `DEBUG=ccsql:*`. This style of log filtering is from a tool called [DEBUG by VisionMedia](https://github.com/visionmedia/debug). It is a widely used component and syntax standard implemented simply and elegantly. It was intended to handle libraries/components output by allowing you to focus only on the output of a single or group of components. We call this a "namespace" (from later community developments around the core tool). This subtle shift of emphasis is allow interpretations that compose libraries or families of components together and treat them as a single logging unit. In this example `ccsql` is the namespace and `request` is the module.

## Channels
While namespaces provide a nice vertical filter on the output, sometimes you only want to output certain types of messages. For instance if you come across an error message, you may turn on more logging to provide context. This kind of vertical filters are called "logging levels" and are as old as the hills used in inux [syslog](https://access.redhat.com/documentation/en-us/red_hat_gluster_storage/3/html/administration_guide/configuring_the_log_level) for example. It really came into its own with Java's [Log4J](https://en.wikipedia.org/wiki/Log4j). The idea is that you log to a partciular channel/topic/level (pick your term and use it at the next party) and them filter the channel using  progressive filters. We define these:

- `error` - You guessed it, for reporting errors.
- `warn` - Warnings are guards you put in your code to indicate a situation that needs investigation.
- `info` - Messages about the execution context, servers states, statistics and environment.
- `log` - General logging messages
- `debug` - Debugging info generally contains variable values
- `data` - Use with care, but you can track raw data
- `trace` - The lowest level of information you judge to be potentially useful when maintaining a system

Adhering to those definitions allows you filter the logs down to the most useful information when analyzing issues or performance. There are two ways to filter the logs by channel.

## Progressive Filtering
You can set the filter by command line or from the environment. The environment variable `DEBUG_LEVEL` will accept any of the channel names. When you set it to a level, it will display that level and all those above. cf:

| Level | Dispays   |
|---    |---
| error | error     |
| warn  | error, warn |
| info  | error, warn, info |
| ...   | ... |
| trace | error, warn, info, log, data, debug, trace |

You can also set this from the command line. `--log-level` accepts the same syntax as `DEBUG_LEVEL`. You can also use the NPM-like `-v`, `-vv`, `-vvv`, etc.

## Static Filtering
The `DEBUG` variable will allow you to select just one channel and report only on that. It works by adding the channel name to the `DEBUG` instance.

```bash
DEBUG=ccsql:*:info  # will show only info, not
                    # the progressive info+warn+error
```

# Guidance
When designing your logging strategy, start with the notion that less than 3% of your code will produce >70% of your errors. Debugging statements that you needed during development will likely be needed later when you try to figure out why it went [pear-shaped](https://www.urbandictionary.com/define.php?term=pear%20shaped) at run time. These kinds of statements are typically published on the `trace` and `debug` channels. Those channels are the noisiest and it may seem like that may not be desirable as it will pollute the logs. But recall that they only print when the filter includes them and they are essentially free because if they are filtered out (which happens at application start) `logger.debug` or `logger.trace` become no-ops and don't inflict an execution price.

When you are working on a package, or a component that is only called by other components - IOW it never starts/is the start of a process - you should declare your namespace *in your inline documentation* (you are doing that, right?) and *certainly in your README.md* (you are doing that, right?), so that when the people with their hair on fire are trying to figure out how you [screwed the pooch](https://www.urbandictionary.com/define.php?term=screwed%20the%20pooch) they can quickly turn on your namespace and laugh at you. I mean "fix the problem". You treat the logs passively, assuming nothing other than the fact that your logs will display on demand, but never otherwise. That's right. The log is quiet by default. That is because only the calling process really knows what is needed.

So what if you are the initiating process? Well, you too are quiet by default. But you should declare what namespaces should report by default. Because the logging system depends on the enviornment, before you `require`/`import` the library the first time, set variables as necessary.

```javascript
// We check to see if DEBUG has a value and if so add our namespace to it, otherwise we set it
// to the default
process.env.DEBUG = process.env.DEBUG ? `$process.env.DEBUG} myapp:*`: "myapp:*";
// The default level (channel) is set here if not already set
process.env.DEBUG_LEVEL = process.env.DEBUG_LEVEL || "info";
// Now call the logging library. But setting this up via the environment means that
// it can be overridden by the command line. Yow!
const {getLogger} = require("@terryweiss/logger");
```

Here's how you should organize your logs.

- `log` - This is written to STDOUT. This is the most important channel. This is the channel that monitoring systems will use to determine the state of your application. If you report a heart beat, publish it here. Transaction rates for I/O operations should be published. State changes and configuration changes should be published here. Logs should contain consistent grammar and language.
- `error` - This is writtem to STDERR. It should contain an introductory message indicating where the error occurred. The error itself should be recorded as the second parameter: `logger.error("Error reported while connecting.", error);`.
- `warn` - This is written to STDERR. It should contain all those moments where you saved the system. Places where you got an unexpected result, you corrected it, but you want to look at it later. `warn` logs should be reviewed for each release cycle.
- `debug`, `trace` - This is written to STDOUT. These are very noisy, but excellent indicators of internal state. `trace` should record locaton, i.e. `logger.trace("Entering turnPurple method");`. `debug` should contain the value of `logger.debug("myVar after turning purple",myVar);`
- `data`, `info` - These are yours. Use wisely.


# Building
`cclogger` is built in Typescript and uses good ol' `make` to build. You will need these tools:

```bash
npm install --global typescript # with admin rights
npm install --global typedoc typedoc-plugin-markdown
npm install --global typedoc-plugin-external-module-name
```

You will, of course, also need `make`. Please use the [Cygwin](https://cygwin.com/install.html) or [Swan](http://www.starlig.ht/install/) versions and make sure that the tools are in your `PATH`.

```bash

# build the library
make build

# to clean up the current build
make clean

# to blow away the entire build and start over
make dist-clean

# to build the documentation
make techdocs

# to clean up and build everything again
make build-all

# to create a new patch version - make sure you
# are fully checkin first
make patch-up

# to create a new minor version - make sure you
# are fully checkin first
make minor-up

# to build and publish to npm.org
make publish

```
