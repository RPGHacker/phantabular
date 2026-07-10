# PhanTabular
A feature-rich browser extension (currently Firefox only) for archiving, categorizing, bookmarking and backing up browser tabs.

## Development
The extension uses [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for managing dependendencies. This guide assumes a functioning install of npm on your system.

To install all required dependencies, open a command prompt in the project's root directory and run

```
npm install
```

In order to test the extension, any build of [Firefox](https://www.firefox.com) (version 154.0 or newer) is required. However, if you intend to test session restore functionality (which doesn't work when only loading extensions temporarily), you will need [Firefox Developer Edition](https://www.firefox.com/en-US/channel/desktop/developer/) in order to load unsigned .xpi extension files. Another benefit of using Firefox Developer Edition edition is that it uses its own profiles, so there's no risk of accidentally messing with data in your main browser while working on the extension.

Once dependencies have been installed, simply run

```
npm run dev
```

from the project root. This will bundle all required files into the `dist` directory and also keep a watch on the project to automatically re-run bundling when updating any code.

In Firefox, open the URL `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on..." and then select `dist/manifest.json`. The extension is now loaded into your browser for the current session and can be tested. Most code changes will automatically be reflected onto the extension on page reload due to the active watch, but some changes require manual reloads. Typically changing anything in `vite.config.json` or in the `assets/public` directory requires stopping the active watch (done in most terminals by pressing `CTRL + C`) and re-running the command line above. Editing `assets/public/manifest.json` in particular also requires clicking the extension's "Reload" button in Firefox's "Temporary Extensions" list after re-running the command line above.

In order to test any features that are tied to opening the browser (such as the various session restore settings), it's not sufficient to load the extension only temporarily. It needs to be properly installed in the browser. In order to do this, first follow the steps listed below under ["Packaging"](#packaging) in order to create `build/phantabular.xpi`. If you haven't done so yet, install [Firefox Developer Edition](https://www.firefox.com/en-US/channel/desktop/developer/), which is required for loading unsigned extensions. In it, open the URL `about:config`, search for the setting `xpinstall.signatures.required` and set it to `False`. Then simply drag and drop `build/phantabular.xpi` onto Firefox Developer Edition in order to get the install prompt for the extension. Note that no live updating is supported when testing the extension this way, so any update will require re-running the packaging process and re-installing the extension in Firefox Developer Edition. If you plan to return to a temporary extension afterwards, it's strongly recommended to uninstall the extension from the browser first.

### Debugging Helper

The module `src/shared/debughelper.mjs` contains functions that are useful for debugging the extension. One of its purposes is to wrap the default console logging functionality, which has a few benefits:

- It provides `*Verbose()` versions of logging functions (e.g. `logVerbose()`) that only appear in the log when a specific switch is active.
- It's easier to provide custom formatting for specific arguments (such as timestamps, which are very commonly used in the extension).
- Additional information like the current time or a call stack can be attached to the log.
- A copy of the log can be stored in local storage and replayed, which is especially helpful when debugging session restore scenarios.

To fully leverage all of these benefits, calling console functions like

```
console.log()
console.warn()
console.error()
```

directly should be avoided in favor of calling

```
debugh.log()
debugh.logVerbose()
debugh.warn()
debugh.warnVerbose()
debugh.error()
debugh.errorVerbose()
```

The behavior of the helper can be configured by calling functions directly from the console of your browser's inspector:

```
debugh.setVerboseModeEnabled(true);
```

Enables verbose logging functions.

---

```
debugh.setStoredLogDataEnabled(true);
```

Enables storing a copy of logged data in local storage.

---

```
debugh.setMaxNumStoredLogDatas(200);
```

Configures the maximum amount of log entries that can be stored in local storage.

---

```
debugh.clearStoredLogDatas();
```

Deletes all log entries from local storage.

---

```
debugh.replayStoredLogDatas();
```

Prints all log entries in local storage to the console.

---

```
debugh.setStoreCallStacks(true);
```

Enables storing the call stack of log function calls in local storage along with the log data (only applies if storing log data is enabled).

---

```
debugh.setPrintCallStacks(true);
```

Enables printing the callstack of all log function calls.

## Packaging

The packaging process creates an .xpi extension file that can be installed in Firefox (to install unsigned .xpi files, [Firefox Developer Edition](https://www.firefox.com/en-US/channel/desktop/developer/) is required). Functioning installs of [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [Python 3.x](https://www.python.org/downloads/) are required to run the packaging script.

To start the process, simply run

```
python package.py
```

from the project's root directory. If successful, this should create `build/phantabular.xpi`.