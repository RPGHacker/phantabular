import debugh from "./debughelper.mjs";
import jsonata from "../deps/jsonata/dist/jsonata.mjs";

export class RuleEvaluator {
	constructor() {
		this._jsonataBindings = {
			startsWith: (str, token) => str.startsWith(token),
			endsWith: (str, token) => str.endsWith(token),
		};
	}
	
	_generateFullRuleText(functionText) {
		const ruleWithIndentation = functionText.replace(/^/gm, "\t\t");
		
		const fullRule = `
		(
			$_includeTab := function($tab) {(
		${ruleWithIndentation}
			)};
			
			$_includeTab(_tabs[0])
		)`;
		
		return fullRule;
	}
	
	async _evaluateWithJsonata(rule, context) {		
		const expression = jsonata(rule);
		
		const result = await expression.evaluate(context, this._jsonataBindings);
		
		return result;
	}
	
	_generateJsonataErrorText(error) {
		const userReadableError = `${error.code}: ${error.token}: ${error.message}`;
		
		return userReadableError;
	}
	
	async matchesRule(tab, rule) {
		if (rule === undefined) {
			return false;
		}
		
		const context = {
			_tabs: [ tab ]
		}
		
		let evalResult = false;
		
		const fullRule = this._generateFullRuleText(rule);

		try {
			evalResult = await this._evaluateWithJsonata(fullRule, context);
		} catch (error) {			
			debugh.error("Auto-catch rule evaluation failed: " + this._generateJsonataErrorText(error));
			return false;
		}
		
		if (evalResult !== true && evalResult !== false) {
			debugh.error(`An auto-catch rule returned "${evalResult}". Only "true" or "false" are allowed as return values.`);
			return false;
		}
		
		return evalResult;
	}
	
	async validateRule(rule, testTab = undefined) {
		if (rule === undefined) {
			return false;
		}
		
		if (testTab === undefined) {
			testTab = await browser.tabs.query({ active: true, currentWindow: true });
		}
		
		const context = {
			_tabs: [ testTab ]
		}
		
		let evalResult = false;
		
		const fullRule = this._generateFullRuleText(rule);

		try {
			evalResult = await this._evaluateWithJsonata(fullRule, context);
		} catch (error) {			
			throw new Error(this._generateJsonataErrorText(error));
		}
		
		if (evalResult !== true && evalResult !== false) {
			throw new Error(`Rule evaluation returned "${evalResult}". Only "true" or "false" are allowed as return values.`);
		}
		
		return evalResult;
	}
}

export const ruleeval = new RuleEvaluator();
export { ruleeval as default };
