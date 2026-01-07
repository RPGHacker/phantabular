/*
	Enable extended debug functionality by calling the following functions from the developer console:
	
	Enable verbose logging:
	debugh.setVerboseModeEnabled(true);
	
	Enable storing log data in local storage:
	debugh.setStoredLogDataEnabled(true);
	
	Set the maximum number of log datas that can be stored:
	debugh.setMaxNumStoredLogDatas(200);
	
	Clear stored log datas:
	debugh.clearStoredLogDatas();
	
	Replay stored log datas:
	debugh.replayStoredLogDatas();
*/

export class TimeStamp {
	constructor(unixTimeStamp) {
		this._type = "TimeStamp";
		this.unixTimeStamp = unixTimeStamp;
	}
}

export class DebugHelper {
	constructor() {		
		this._logPrefix = "[PhanTabular]";
		
		this._dateOptions = {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		};
		
		this._defaultStorage = {
			debugSettings: {
				loggingEnabled: true,
				verboseMode: false,
				storedLogDataEnabled: false,
				storedLogData: [],
				maxNumStoredLogDatas: 200
			}
		};
		this._storage = JSON.parse(JSON.stringify(this._defaultStorage));
		
		this._bufferDuringInitialization = [];
		this._storagePromise = browser.storage.local.get(this._storage);
		this._storagePromise.then((storage) => {
			this._storage = storage;
			this._patchMissingSettings(this._storage, this._defaultStorage);
			// Needs to be nulled before calling _flushBuffer().
			this._storagePromise = null;
			this._flushBuffer();
		});
		
		browser.storage.local.onChanged.addListener((changes) => {
			// Not using internal log functions here, as they will cause this litener to trigger again.
			console.log(this._logPrefix, "Detected changed settings in local storage.");
			
			for (const changedKey in changes) {
				if (this._storage[changedKey]) {
					this._storage[changedKey] = JSON.parse(JSON.stringify(changes[changedKey].newValue));
					this._patchMissingSettings(this._storage[changedKey], this._defaultStorage[changedKey]);
				}
			}
		});
	}
	
	async waitForInitialization() {
		if (this._storagePromise) {
			await this._storagePromise;
			this._storagePromise = null;
		}
	}
	
	_patchMissingSettings(target, source) {
		for (const key in source) {
			if (typeof target[key] === "object") {
				if (typeof target[key] === "undefined") {
					target[key] = JSON.parse(JSON.stringify(source[key]));
				} else {
					this._patchMissingSettings(target[key], source[key]);
				}
			} else {
				if (typeof target[key] === "undefined") {
					target[key] = source[key];
				}
			}
		}
	}
	
	async verboseModeEnabled() {
		if (this._storagePromise) {
			await this._storagePromise;
		}
		return this._storage.debugSettings.verboseMode;
	}
	
	setVerboseModeEnabled(enabled) {
		this._storage.debugSettings.verboseMode = enabled;
		this._updateStorage();
	}
	
	setStoredLogDataEnabled(enabled) {
		this._storage.debugSettings.storedLogDataEnabled = enabled;
		if (!this._storage.debugSettings.storedLogDataEnabled) {
			this._storage.debugSettings.storedLogData = [];
		}
		this._updateStorage();
	}
	
	setMaxNumStoredLogDatas(maxNum) {
		this._storage.debugSettings.maxNumStoredLogDatas = maxNum;
		this._updateStorage();
	}
	
	clearStoredLogDatas() {
		this._storage.debugSettings.storedLogData = [];
		this._updateStorage();
	}
	
	formatTimestamp(timeStamp) {
		return new TimeStamp(timeStamp);
	}
	
	replayStoredLogDatas() {
		if (!this._storage.debugSettings.storedLogDataEnabled) {
			console.error("Stored log datas are disabled. Call \"debugh.setStoredLogDataEnabled(true);\" from the console to enable them.");
			return;
		}
		
		console.log("Replaying stored log datas:");
		console.log("----------------------------------------------------");
		
		for (const storedLogData of this._storage.debugSettings.storedLogData) {
			const readableDate = new Date(storedLogData.timeStamp).toLocaleDateString(undefined, this._dateOptions);
			console[storedLogData.logFunction](...this._generateLogArgs(this.formatTimestamp(storedLogData.timeStamp), ...storedLogData.args));
		}
		
		console.log("----------------------------------------------------");
		console.log("End of replay");
	}
	
	_updateStorage() {		
		browser.storage.local.set(this._storage);
	}
	
	
	log(...args) {		
		this._nativeLog("log", "normal", this._logPrefix, ...args);
	}
	
	error(...args) {		
		this._nativeLog("error", "normal", this._logPrefix, ...args);
	}
	
	warn(...args) {		
		this._nativeLog("warn", "normal", this._logPrefix, ...args);
	}
	
	
	logVerbose(...args) {		
		this._nativeLog("log", "verbose", this._logPrefix, "(Verbose)", ...args);
	}
	
	errorVerbose(...args) {		
		this._nativeLog("error", "verbose", this._logPrefix, "(Verbose)", ...args);
	}
	
	warnVerbose(...args) {		
		this._nativeLog("warn", "verbose", this._logPrefix, "(Verbose)", ...args);
	}
	
	// Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
	_getBespokeType(value) {
		if (value === null) {
			return "null";
		}
		const baseType = typeof value;
		// Primitive types
		if (!["object", "function"].includes(baseType)) {
			return baseType;
		}
		
		if (typeof value._type !== "undefined") {
			return value._type;
		}
	
		// Symbol.toStringTag often specifies the "display name" of the
		// object's class. It's used in Object.prototype.toString().
		const tag = value[Symbol.toStringTag];
		if (typeof tag === "string") {
			return tag;
		}
	
		// If it's a function whose source code starts with the "class" keyword
		if (
			baseType === "function" &&
			Function.prototype.toString.call(value).startsWith("class")
		) {
			return "class";
		}
	
		// The name of the constructor; for example `Array`, `GeneratorFunction`,
		// `Number`, `String`, `Boolean` or `MyCustomClass`
		const className = value.constructor.name;
		if (typeof className === "string" && className !== "") {
			return className;
		}
	
		// At this point there's no robust way to get the type of value,
		// so we use the base implementation.
		return baseType;
	}
	
	_generateLogArgs(...args) {
		const defaultStyle = "display: inline-block; margin-right: 0px;";
		const initialFormattingString = "%c";
		let formattingString = initialFormattingString;
		const params = [defaultStyle];
		
		for (const arg of args) {
			if (formattingString !== initialFormattingString) {
				formattingString += " ";
			}
			
			switch (this._getBespokeType(arg)) {
				case "TimeStamp":
					formattingString += "%c%s%c";
					const readableDate = new Date(arg.unixTimeStamp).toLocaleDateString(undefined, this._dateOptions);
					params.push("color: aquamarine; display: inline-block; margin-right: 0px;");
					params.push(`[${arg.unixTimeStamp} | ${readableDate}]`);
					params.push(defaultStyle);
					break;
					
				default:
					formattingString += "%o";
					params.push(arg);
					break;
				
			}
		}
		
		return [formattingString, ...params];
	}
	
	_nativeLog(logFunction, logType, ...args) {
		if (this._storagePromise) {
			this._writeToBuffer(logFunction, logType, ...args);
			return;
		}
		
		if (!this._storage.debugSettings.loggingEnabled
			|| (logType == "verbose" && !this._storage.debugSettings.verboseMode)) {
			return;
		}
		
		console[logFunction](...this._generateLogArgs(...args));
		
		if (this._storage.debugSettings.storedLogDataEnabled) {
			if (this._storage.debugSettings.storedLogData.length >= this._storage.debugSettings.maxNumStoredLogDatas) {
				this._storage.debugSettings.storedLogData.splice(0, this._storage.debugSettings.storedLogData.length - this._storage.debugSettings.maxNumStoredLogDatas);
			}
		
			this._storage.debugSettings.storedLogData.push({
				logFunction: logFunction,
				timeStamp: Date.now(),
				args: JSON.parse(JSON.stringify([...args]))
			});
			
			this._updateStorage();
		}
	}
	
	_writeToBuffer(logFunction, logType, ...args) {
		if (!this._storagePromise) {
			throw("Trying to store log data in initialization buffer after initialization has already resolved.");
		}
		
		this._bufferDuringInitialization.push({
			logFunction: logFunction,
			logType: logType,
			args: JSON.parse(JSON.stringify([...args]))
		});
	}
	
	_flushBuffer() {
		for (const bufferedData of this._bufferDuringInitialization) {
			// Should work, because this._storagePromise gets nulled before this function is called.
			this._nativeLog(bufferedData.logFunction, bufferedData.logType, ...bufferedData.args);
		}
		
		this._bufferDuringInitialization = null;
	}
}

export const debugh = new DebugHelper();
export { debugh as default };

// Is this considered evil? The purpose is to allow us to use our debug functions from the console.
window.debugh = debugh
		
self.addEventListener("error", (event) => {
	debugh.error(`Unhandled error at ${event.filename}:${event.lineno}:${event.colno}:`, event.message, "\nCallstack:\n", event.error?.stack);
});

self.addEventListener("unhandledrejection", (event) => {
	debugh.error("Unhandled rejection:", event.reason, "\nCallstack:\n", event.reason?.stack);
});
