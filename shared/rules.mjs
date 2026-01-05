import debugh from "./debughelper.mjs";
import Jexl from "../deps/jexl/jexl.bundle.js";

export class RuleEvaluator {
	constructor() {
		this._capturingGroupTargetRegExp = /^[A-Za-z_][A-Za-z0-9_]*$/;
	}
	
	// We currently create a new Jexl instance every time we evaluate
	// a rule, which kinda sucks, but that's the only way I can think
	// of to get our desired RegEx functionality with support for
	// capturing groups into this thing in a manner that should be
	// safe even across multiple evaluators running asynchronously
	// at the same time.
	async _evaluateWithNewJexlInstance(rule, context) {
		const jexl = new Jexl.Jexl;
		
		const temporaryContext = JSON.parse(JSON.stringify(context));
		const _capturingGroupTargetRegExp = this._capturingGroupTargetRegExp;
		
		function matchRegex(string, expression, capturingGroupTargetVariableName) {
			if (capturingGroupTargetVariableName) {
				if (!_capturingGroupTargetRegExp.test(capturingGroupTargetVariableName)) {
					throw "Invalid target variable name passed to matchRegex: \"" + capturingGroupTargetVariableName + "\".\nThe variable name may online contain alphanumeric characters and underscores and must not start with a digit.";
				}
			}
			
			let flags = "";
			
			if (expression.startsWith("/")) {
				const lastSlashIndex = expression.lastIndexOf("/");
				flags = expression.substring(lastSlashIndex + 1);
				expression = expression.substring(1, lastSlashIndex);
			}
			
			const regEx = new RegExp(expression, flags);
			
			const result = regEx.exec(string);
			
			if (capturingGroupTargetVariableName) {
				if (typeof temporaryContext[capturingGroupTargetVariableName] !== "undefined") {
					throw "Variable \"" + capturingGroupTargetVariableName + "\" already exists in the rule context.\nPlease use the name of a variable that doesn't exist yet as the capturing group target of matchRegex.";
				}
				temporaryContext[capturingGroupTargetVariableName] = result;
			}
			
			return (result !== null);
		}
		
		jexl.addFunction("matchRegex", matchRegex);
		jexl.addFunction("startsWith", (string, substring) => { return string.startsWith(substring); });
		jexl.addFunction("endsWith", (string, substring) => { return string.endsWith(substring); });
		jexl.addTransform('lower', (val) => val.toLowerCase());
		jexl.addTransform('upper', (val) => val.toUpperCase());
		
		return jexl.eval(rule, temporaryContext);
	}
	
	async matchesRule(tab, rule) {
		if (rule === undefined) {
			return false;
		}
		
		const context = {
			tab: tab
		}		
		
		let evalResult = false;

		try {
			evalResult = await this._evaluateWithNewJexlInstance(rule, context);
		} catch (error) {
			debugh.error("Auto-catch rule evaluation failed: " + error);
		}
		
		return evalResult;
	}
	
	async isRuleValid(rule) {
		if (rule === undefined) {
			return true;
		}
		
		const testTab = await browser.tabs.query({ active: true, currentWindow: true });
		
		const context = {
			tab: testTab
		}
		
		return this._evaluateWithNewJexlInstance(rule, context);
	}
}

export const ruleeval = new RuleEvaluator();
export { ruleeval as default };
