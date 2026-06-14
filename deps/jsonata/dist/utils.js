"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/**
 * © Copyright IBM Corp. 2016, 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

var utils = function () {
  'use strict';

  /**
   * Check if value is a finite number
   * @param {float} n - number to evaluate
   * @returns {boolean} True if n is a finite number
   */
  function isNumeric(n) {
    var isNum = false;
    if (typeof n === 'number') {
      isNum = !isNaN(n);
      if (isNum && !isFinite(n)) {
        throw {
          code: "D1001",
          value: n,
          stack: new Error().stack
        };
      }
    }
    return isNum;
  }

  /**
   * Returns true if the arg is an array of strings
   * @param {*} arg - the item to test
   * @returns {boolean} True if arg is an array of strings
   */
  function isArrayOfStrings(arg) {
    var result = false;
    /* istanbul ignore else */
    if (Array.isArray(arg)) {
      result = arg.filter(function (item) {
        return typeof item !== 'string';
      }).length === 0;
    }
    return result;
  }

  /**
   * Returns true if the arg is an array of numbers
   * @param {*} arg - the item to test
   * @returns {boolean} True if arg is an array of numbers
   */
  function isArrayOfNumbers(arg) {
    var result = false;
    if (Array.isArray(arg)) {
      result = arg.filter(function (item) {
        return !isNumeric(item);
      }).length === 0;
    }
    return result;
  }

  /**
   * Tests if a value is a sequence
   * @param {*} value the value to test
   * @returns {boolean} true if it's a sequence
   */
  function isSequence(value) {
    return value.sequence === true && Array.isArray(value);
  }

  /**
   *
   * @param {Object} arg - expression to test
   * @returns {boolean} - true if it is a function (lambda or built-in)
   */
  function isFunction(arg) {
    return arg && (arg._jsonata_function === true || arg._jsonata_lambda === true) || typeof arg === 'function';
  }

  /**
   * Returns the arity (number of arguments) of the function
   * @param {*} func - the function
   * @returns {*} - the arity
   */
  function getFunctionArity(func) {
    var arity = typeof func.arity === 'number' ? func.arity : typeof func.implementation === 'function' ? func.implementation.length : typeof func.length === 'number' ? func.length : func.arguments.length;
    return arity;
  }

  /**
   * Tests whether arg is a lambda function
   * @param {*} arg - the value to test
   * @returns {boolean} - true if it is a lambda function
   */
  function isLambda(arg) {
    return arg && arg._jsonata_lambda === true;
  }

  // istanbul ignore next
  var iteratorSymbol = (typeof Symbol === "function" ? Symbol : {}).iterator || "@@iterator";

  /**
   * @param {Object} arg - expression to test
   * @returns {boolean} - true if it is iterable
   */
  function isIterable(arg) {
    return _typeof(arg) === 'object' && arg !== null && iteratorSymbol in arg && 'next' in arg && typeof arg.next === 'function';
  }

  /**
   * Compares two values for equality
   * @param {*} lhs first value
   * @param {*} rhs second value
   * @returns {boolean} true if they are deep equal
   */
  function isDeepEqual(lhs, rhs) {
    if (lhs === rhs) {
      return true;
    }
    if (_typeof(lhs) === 'object' && _typeof(rhs) === 'object' && lhs !== null && rhs !== null) {
      if (Array.isArray(lhs) && Array.isArray(rhs)) {
        // both arrays (or sequences)
        // must be the same length
        if (lhs.length !== rhs.length) {
          return false;
        }
        // must contain same values in same order
        for (var ii = 0; ii < lhs.length; ii++) {
          if (!isDeepEqual(lhs[ii], rhs[ii])) {
            return false;
          }
        }
        return true;
      }
      // both objects
      // must have the same set of keys (in any order)
      var lkeys = Object.getOwnPropertyNames(lhs);
      var rkeys = Object.getOwnPropertyNames(rhs);
      if (lkeys.length !== rkeys.length) {
        return false;
      }
      lkeys = lkeys.sort();
      rkeys = rkeys.sort();
      for (ii = 0; ii < lkeys.length; ii++) {
        if (lkeys[ii] !== rkeys[ii]) {
          return false;
        }
      }
      // must have the same values
      for (ii = 0; ii < lkeys.length; ii++) {
        var key = lkeys[ii];
        if (!isDeepEqual(lhs[key], rhs[key])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * @param {Object} arg - expression to test
   * @returns {boolean} - true if it is a promise
   */
  function isPromise(arg) {
    return _typeof(arg) === 'object' && arg !== null && 'then' in arg && typeof arg.then === 'function';
  }

  /**
   * converts a string to an array of characters
   * @param {string} str - the input string
   * @returns {Array} - the array of characters
   */
  function stringToArray(str) {
    var arr = [];
    var _iterator = _createForOfIteratorHelper(str),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _char = _step.value;
        arr.push(_char);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return arr;
  }
  return {
    isNumeric: isNumeric,
    isArrayOfStrings: isArrayOfStrings,
    isArrayOfNumbers: isArrayOfNumbers,
    isSequence: isSequence,
    isFunction: isFunction,
    isLambda: isLambda,
    isIterable: isIterable,
    getFunctionArity: getFunctionArity,
    isDeepEqual: isDeepEqual,
    stringToArray: stringToArray,
    isPromise: isPromise
  };
}();
module.exports = utils;