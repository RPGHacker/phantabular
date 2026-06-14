"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * © Copyright IBM Corp. 2016, 2018 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

var utils = require('./utils');
var functions = function () {
  'use strict';

  var isNumeric = utils.isNumeric;
  var isArrayOfStrings = utils.isArrayOfStrings;
  var isArrayOfNumbers = utils.isArrayOfNumbers;
  var isSequence = utils.isSequence;
  var isFunction = utils.isFunction;
  var isLambda = utils.isLambda;
  var isPromise = utils.isPromise;
  var getFunctionArity = utils.getFunctionArity;
  var deepEquals = utils.isDeepEqual;
  var stringToArray = utils.stringToArray;

  /**
   * Sum function
   * @param {Object} args - Arguments
   * @returns {number} Total value of arguments
   */
  function sum(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined') {
      return undefined;
    }
    var total = 0;
    args.forEach(function (num) {
      total += num;
    });
    return total;
  }

  /**
   * Count function
   * @param {Object} args - Arguments
   * @returns {number} Number of elements in the array
   */
  function count(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined') {
      return 0;
    }
    return args.length;
  }

  /**
   * Max function
   * @param {Object} args - Arguments
   * @returns {number} Max element in the array
   */
  function max(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined' || args.length === 0) {
      return undefined;
    }
    return Math.max.apply(Math, args);
  }

  /**
   * Min function
   * @param {Object} args - Arguments
   * @returns {number} Min element in the array
   */
  function min(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined' || args.length === 0) {
      return undefined;
    }
    return Math.min.apply(Math, args);
  }

  /**
   * Average function
   * @param {Object} args - Arguments
   * @returns {number} Average element in the array
   */
  function average(args) {
    // undefined inputs always return undefined
    if (typeof args === 'undefined' || args.length === 0) {
      return undefined;
    }
    var total = 0;
    args.forEach(function (num) {
      total += num;
    });
    return total / args.length;
  }

  /**
   * Stringify arguments
   * @param {Object} arg - Arguments
   * @param {boolean} [prettify] - Pretty print the result
   * @returns {String} String from arguments
   */
  function string(arg) {
    var prettify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    var str;
    if (typeof arg === 'string') {
      // already a string
      str = arg;
    } else if (isFunction(arg)) {
      // functions (built-in and lambda convert to empty string
      str = '';
    } else if (typeof arg === 'number' && !isFinite(arg)) {
      throw {
        code: "D3001",
        value: arg,
        stack: new Error().stack
      };
    } else {
      var space = prettify ? 2 : 0;
      if (Array.isArray(arg) && arg.outerWrapper) {
        arg = arg[0];
      }
      str = JSON.stringify(arg, function (key, val) {
        if (typeof val !== 'undefined' && val !== null && isNumeric(val)) {
          return val.toPrecision && !Number.isInteger(val) ? Number(val.toPrecision(15)) : val;
        }
        return val && isFunction(val) ? '' : val;
      }, space);
    }
    return str;
  }

  /**
   * Create substring based on character number and length
   * @param {String} str - String to evaluate
   * @param {Integer} start - Character number to start substring
   * @param {Integer} [length] - Number of characters in substring
   * @returns {string|*} Substring
   */
  function substring(str, start, length) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    var strArray = stringToArray(str);
    var strLength = strArray.length;
    if (strLength + start < 0) {
      start = 0;
    }
    if (typeof length !== 'undefined') {
      if (length <= 0) {
        return '';
      }
      var end = start >= 0 ? start + length : strLength + start + length;
      return strArray.slice(start, end).join('');
    }
    return strArray.slice(start).join('');
  }

  /**
   * Create substring up until a character
   * @param {String} str - String to evaluate
   * @param {String} chars - Character to define substring boundary
   * @returns {*} Substring
   */
  function substringBefore(str, chars) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    var pos = str.indexOf(chars);
    if (pos > -1) {
      return str.substr(0, pos);
    } else {
      return str;
    }
  }

  /**
   * Create substring after a character
   * @param {String} str - String to evaluate
   * @param {String} chars - Character to define substring boundary
   * @returns {*} Substring
   */
  function substringAfter(str, chars) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    var pos = str.indexOf(chars);
    if (pos > -1) {
      return str.substr(pos + chars.length);
    } else {
      return str;
    }
  }

  /**
   * Lowercase a string
   * @param {String} str - String to evaluate
   * @returns {string} Lowercase string
   */
  function lowercase(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    return str.toLowerCase();
  }

  /**
   * Uppercase a string
   * @param {String} str - String to evaluate
   * @returns {string} Uppercase string
   */
  function uppercase(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    return str.toUpperCase();
  }

  /**
   * length of a string
   * @param {String} str - string
   * @returns {Number} The number of characters in the string
   */
  function length(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    return stringToArray(str).length;
  }

  /**
   * Normalize and trim whitespace within a string
   * @param {string} str - string to be trimmed
   * @returns {string} - trimmed string
   */
  function trim(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // normalize whitespace
    var result = str.replace(/[ \t\n\r]+/gm, ' ');
    if (result.charAt(0) === ' ') {
      // strip leading space
      result = result.substring(1);
    }
    if (result.charAt(result.length - 1) === ' ') {
      // strip trailing space
      result = result.substring(0, result.length - 1);
    }
    return result;
  }

  /**
   * Pad a string to a minimum width by adding characters to the start or end
   * @param {string} str - string to be padded
   * @param {number} width - the minimum width; +ve pads to the right, -ve pads to the left
   * @param {string} [char] - the pad character(s); defaults to ' '
   * @returns {string} - padded string
   */
  function pad(str, width, _char) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    if (typeof _char === 'undefined' || _char.length === 0) {
      _char = ' ';
    }
    var result;
    width = Math.trunc(width);
    var padLength = Math.abs(width) - length(str);
    if (padLength > 0) {
      var padding = new Array(padLength + 1).join(_char);
      if (_char.length > 1) {
        padding = substring(padding, 0, padLength);
      }
      if (width > 0) {
        result = str + padding;
      } else {
        result = padding + str;
      }
    } else {
      result = str;
    }
    return result;
  }

  /**
   * Evaluate the matcher function against the str arg
   *
   * @param {*} matcher - matching function (native or lambda)
   * @param {string} str - the string to match against
   * @returns {object} - structure that represents the match(es)
   */
  function evaluateMatcher(_x, _x2) {
    return _evaluateMatcher.apply(this, arguments);
  }
  /**
   * Tests if the str contains the token
   * @param {String} str - string to test
   * @param {String} token - substring or regex to find
   * @returns {Boolean} - true if str contains token
   */
  function _evaluateMatcher() {
    _evaluateMatcher = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(matcher, str) {
      var result;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            result = matcher.apply(this, [str]); // eslint-disable-line no-useless-call
            if (!isPromise(result)) {
              _context.n = 2;
              break;
            }
            _context.n = 1;
            return result;
          case 1:
            result = _context.v;
          case 2:
            if (!(result && !(typeof result.start === 'number' || result.end === 'number' || Array.isArray(result.groups) || isFunction(result.next)))) {
              _context.n = 3;
              break;
            }
            throw {
              code: "T1010",
              stack: new Error().stack
            };
          case 3:
            return _context.a(2, result);
        }
      }, _callee, this);
    }));
    return _evaluateMatcher.apply(this, arguments);
  }
  function contains(_x3, _x4) {
    return _contains.apply(this, arguments);
  }
  /**
   * Match a string with a regex returning an array of object containing details of each match
   * @param {String} str - string
   * @param {String} regex - the regex applied to the string
   * @param {Integer} [limit] - max number of matches to return
   * @returns {Array} The array of match objects
   */
  function _contains() {
    _contains = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(str, token) {
      var result, matches;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2, undefined);
          case 1:
            if (!(typeof token === 'string')) {
              _context2.n = 2;
              break;
            }
            result = str.indexOf(token) !== -1;
            _context2.n = 4;
            break;
          case 2:
            _context2.n = 3;
            return evaluateMatcher(token, str);
          case 3:
            matches = _context2.v;
            result = typeof matches !== 'undefined';
          case 4:
            return _context2.a(2, result);
        }
      }, _callee2);
    }));
    return _contains.apply(this, arguments);
  }
  function match(_x5, _x6, _x7) {
    return _match.apply(this, arguments);
  }
  /**
   * Match a string with a regex returning an array of object containing details of each match
   * @param {String} str - string
   * @param {String} pattern - the substring/regex applied to the string
   * @param {String} replacement - text to replace the matched substrings
   * @param {Integer} [limit] - max number of matches to return
   * @returns {Array} The array of match objects
   */
  function _match() {
    _match = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(str, regex, limit) {
      var result, count, matches;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context3.n = 1;
              break;
            }
            return _context3.a(2, undefined);
          case 1:
            if (!(limit < 0)) {
              _context3.n = 2;
              break;
            }
            throw {
              stack: new Error().stack,
              value: limit,
              code: 'D3040',
              index: 3
            };
          case 2:
            result = this.createSequence();
            if (!(typeof limit === 'undefined' || limit > 0)) {
              _context3.n = 6;
              break;
            }
            count = 0;
            _context3.n = 3;
            return evaluateMatcher(regex, str);
          case 3:
            matches = _context3.v;
            if (!(typeof matches !== 'undefined')) {
              _context3.n = 6;
              break;
            }
          case 4:
            if (!(typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit))) {
              _context3.n = 6;
              break;
            }
            result.push({
              match: matches.match,
              index: matches.start,
              groups: matches.groups
            });
            _context3.n = 5;
            return evaluateMatcher(matches.next);
          case 5:
            matches = _context3.v;
            count++;
            _context3.n = 4;
            break;
          case 6:
            return _context3.a(2, result);
        }
      }, _callee3, this);
    }));
    return _match.apply(this, arguments);
  }
  function replace(_x8, _x9, _x0, _x1) {
    return _replace.apply(this, arguments);
  }
  /**
   * Base64 encode a string
   * @param {String} str - string
   * @returns {String} Base 64 encoding of the binary data
   */
  function _replace() {
    _replace = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(str, pattern, replacement, limit) {
      var self, replacer, result, position, count, index, matches, replacedWith;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context4.n = 1;
              break;
            }
            return _context4.a(2, undefined);
          case 1:
            self = this; // pattern cannot be an empty string
            if (!(pattern === '')) {
              _context4.n = 2;
              break;
            }
            throw {
              code: "D3010",
              stack: new Error().stack,
              value: pattern,
              index: 2
            };
          case 2:
            if (!(limit < 0)) {
              _context4.n = 3;
              break;
            }
            throw {
              code: "D3011",
              stack: new Error().stack,
              value: limit,
              index: 4
            };
          case 3:
            if (typeof replacement === 'string') {
              replacer = function replacer(regexMatch) {
                var substitute = '';
                // scan forward, copying the replacement text into the substitute string
                // and replace any occurrence of $n with the values matched by the regex
                var position = 0;
                var index = replacement.indexOf('$', position);
                while (index !== -1 && position < replacement.length) {
                  substitute += replacement.substring(position, index);
                  position = index + 1;
                  var dollarVal = replacement.charAt(position);
                  if (dollarVal === '$') {
                    // literal $
                    substitute += '$';
                    position++;
                  } else if (dollarVal === '0') {
                    substitute += regexMatch.match;
                    position++;
                  } else {
                    var maxDigits;
                    if (regexMatch.groups.length === 0) {
                      // no sub-matches; any $ followed by a digit will be replaced by an empty string
                      maxDigits = 1;
                    } else {
                      // max number of digits to parse following the $
                      maxDigits = Math.floor(Math.log(regexMatch.groups.length) * Math.LOG10E) + 1;
                    }
                    index = parseInt(replacement.substring(position, position + maxDigits), 10);
                    if (maxDigits > 1 && index > regexMatch.groups.length) {
                      index = parseInt(replacement.substring(position, position + maxDigits - 1), 10);
                    }
                    if (!isNaN(index)) {
                      if (regexMatch.groups.length > 0) {
                        var submatch = regexMatch.groups[index - 1];
                        if (typeof submatch !== 'undefined') {
                          substitute += submatch;
                        }
                      }
                      position += index.toString().length;
                    } else {
                      // not a capture group, treat the $ as literal
                      substitute += '$';
                    }
                  }
                  index = replacement.indexOf('$', position);
                }
                substitute += replacement.substring(position);
                return substitute;
              };
            } else {
              replacer = replacement;
            }
            result = '';
            position = 0;
            if (!(typeof limit === 'undefined' || limit > 0)) {
              _context4.n = 15;
              break;
            }
            count = 0;
            if (!(typeof pattern === 'string')) {
              _context4.n = 4;
              break;
            }
            index = str.indexOf(pattern, position);
            while (index !== -1 && (typeof limit === 'undefined' || count < limit)) {
              result += str.substring(position, index);
              result += replacement;
              position = index + pattern.length;
              count++;
              index = str.indexOf(pattern, position);
            }
            result += str.substring(position);
            _context4.n = 14;
            break;
          case 4:
            _context4.n = 5;
            return evaluateMatcher(pattern, str);
          case 5:
            matches = _context4.v;
            if (!(typeof matches !== 'undefined')) {
              _context4.n = 13;
              break;
            }
          case 6:
            if (!(typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit))) {
              _context4.n = 12;
              break;
            }
            result += str.substring(position, matches.start);
            replacedWith = replacer.apply(self, [matches]);
            if (!isPromise(replacedWith)) {
              _context4.n = 8;
              break;
            }
            _context4.n = 7;
            return replacedWith;
          case 7:
            replacedWith = _context4.v;
          case 8:
            if (!(typeof replacedWith === 'string')) {
              _context4.n = 9;
              break;
            }
            result += replacedWith;
            _context4.n = 10;
            break;
          case 9:
            throw {
              code: "D3012",
              stack: new Error().stack,
              value: replacedWith
            };
          case 10:
            position = matches.start + matches.match.length;
            count++;
            _context4.n = 11;
            return evaluateMatcher(matches.next);
          case 11:
            matches = _context4.v;
            _context4.n = 6;
            break;
          case 12:
            result += str.substring(position);
            _context4.n = 14;
            break;
          case 13:
            result = str;
          case 14:
            _context4.n = 16;
            break;
          case 15:
            result = str;
          case 16:
            return _context4.a(2, result);
        }
      }, _callee4, this);
    }));
    return _replace.apply(this, arguments);
  }
  function base64encode(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    // Use btoa in a browser, or Buffer in Node.js

    var btoa = typeof window !== 'undefined' ? /* istanbul ignore next */window.btoa : function (str) {
      // Simply doing `new Buffer` at this point causes Browserify to pull
      // in the entire Buffer browser library, which is large and unnecessary.
      // Using `global.Buffer` defeats this.
      return new global.Buffer.from(str, 'binary').toString('base64'); // eslint-disable-line new-cap
    };
    return btoa(str);
  }

  /**
   * Base64 decode a string
   * @param {String} str - string
   * @returns {String} Base 64 encoding of the binary data
   */
  function base64decode(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }
    // Use btoa in a browser, or Buffer in Node.js
    var atob = typeof window !== 'undefined' ? /* istanbul ignore next */window.atob : function (str) {
      // Simply doing `new Buffer` at this point causes Browserify to pull
      // in the entire Buffer browser library, which is large and unnecessary.
      // Using `global.Buffer` defeats this.
      return new global.Buffer.from(str, 'base64').toString('binary'); // eslint-disable-line new-cap
    };
    return atob(str);
  }

  /**
   * Encode a string into a component for a url
   * @param {String} str - String to encode
   * @returns {string} Encoded string
   */
  function encodeUrlComponent(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = encodeURIComponent(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "encodeUrlComponent"
      };
    }
    return returnVal;
  }

  /**
   * Encode a string into a url
   * @param {String} str - String to encode
   * @returns {string} Encoded string
   */
  function encodeUrl(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = encodeURI(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "encodeUrl"
      };
    }
    return returnVal;
  }

  /**
   * Decode a string from a component for a url
   * @param {String} str - String to decode
   * @returns {string} Decoded string
   */
  function decodeUrlComponent(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = decodeURIComponent(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "decodeUrlComponent"
      };
    }
    return returnVal;
  }

  /**
   * Decode a string from a url
   * @param {String} str - String to decode
   * @returns {string} Decoded string
   */
  function decodeUrl(str) {
    // undefined inputs always return undefined
    if (typeof str === 'undefined') {
      return undefined;
    }

    // Catch URIErrors when URI sequence is malformed
    var returnVal;
    try {
      returnVal = decodeURI(str);
    } catch (e) {
      throw {
        code: "D3140",
        stack: new Error().stack,
        value: str,
        functionName: "decodeUrl"
      };
    }
    return returnVal;
  }

  /**
   * Split a string into an array of substrings
   * @param {String} str - string
   * @param {String} separator - the token or regex that splits the string
   * @param {Integer} [limit] - max number of substrings
   * @returns {Array} The array of string
   */
  function split(_x10, _x11, _x12) {
    return _split.apply(this, arguments);
  }
  /**
   * Join an array of strings
   * @param {Array} strs - array of string
   * @param {String} [separator] - the token that splits the string
   * @returns {String} The concatenated string
   */
  function _split() {
    _split = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(str, separator, limit) {
      var result, count, matches, start;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            if (!(typeof str === 'undefined')) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2, undefined);
          case 1:
            if (!(limit < 0)) {
              _context5.n = 2;
              break;
            }
            throw {
              code: "D3020",
              stack: new Error().stack,
              value: limit,
              index: 3
            };
          case 2:
            result = [];
            if (!(typeof limit === 'undefined' || limit > 0)) {
              _context5.n = 9;
              break;
            }
            if (!(typeof separator === 'string')) {
              _context5.n = 3;
              break;
            }
            result = str.split(separator, limit);
            _context5.n = 9;
            break;
          case 3:
            count = 0;
            _context5.n = 4;
            return evaluateMatcher(separator, str);
          case 4:
            matches = _context5.v;
            if (!(typeof matches !== 'undefined')) {
              _context5.n = 8;
              break;
            }
            start = 0;
          case 5:
            if (!(typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit))) {
              _context5.n = 7;
              break;
            }
            result.push(str.substring(start, matches.start));
            start = matches.end;
            _context5.n = 6;
            return evaluateMatcher(matches.next);
          case 6:
            matches = _context5.v;
            count++;
            _context5.n = 5;
            break;
          case 7:
            if (typeof limit === 'undefined' || count < limit) {
              result.push(str.substring(start));
            }
            _context5.n = 9;
            break;
          case 8:
            result.push(str);
          case 9:
            return _context5.a(2, result);
        }
      }, _callee5);
    }));
    return _split.apply(this, arguments);
  }
  function join(strs, separator) {
    // undefined inputs always return undefined
    if (typeof strs === 'undefined') {
      return undefined;
    }

    // if separator is not specified, default to empty string
    if (typeof separator === 'undefined') {
      separator = "";
    }
    return strs.join(separator);
  }

  /**
   * Formats a number into a decimal string representation using XPath 3.1 F&O fn:format-number spec
   * @param {number} value - number to format
   * @param {String} picture - picture string definition
   * @param {Object} [options] - override locale defaults
   * @returns {String} The formatted string
   */
  function formatNumber(value, picture, options) {
    // undefined inputs always return undefined
    if (typeof value === 'undefined') {
      return undefined;
    }
    var defaults = {
      "decimal-separator": ".",
      "grouping-separator": ",",
      "exponent-separator": "e",
      "infinity": "Infinity",
      "minus-sign": "-",
      "NaN": "NaN",
      "percent": "%",
      "per-mille": "\u2030",
      "zero-digit": "0",
      "digit": "#",
      "pattern-separator": ";"
    };

    // if `options` is specified, then its entries override defaults
    var properties = defaults;
    if (typeof options !== 'undefined') {
      Object.keys(options).forEach(function (key) {
        properties[key] = options[key];
      });
    }
    var decimalDigitFamily = [];
    var zeroCharCode = properties['zero-digit'].charCodeAt(0);
    for (var ii = zeroCharCode; ii < zeroCharCode + 10; ii++) {
      decimalDigitFamily.push(String.fromCharCode(ii));
    }
    var activeChars = decimalDigitFamily.concat([properties['decimal-separator'], properties['exponent-separator'], properties['grouping-separator'], properties.digit, properties['pattern-separator']]);
    var subPictures = picture.split(properties['pattern-separator']);
    if (subPictures.length > 2) {
      throw {
        code: 'D3080',
        stack: new Error().stack
      };
    }
    var splitParts = function splitParts(subpicture) {
      var prefix = function () {
        var ch;
        for (var ii = 0; ii < subpicture.length; ii++) {
          ch = subpicture.charAt(ii);
          if (activeChars.indexOf(ch) !== -1 && ch !== properties['exponent-separator']) {
            return subpicture.substring(0, ii);
          }
        }
        return "";
      }();
      var suffix = function () {
        var ch;
        for (var ii = subpicture.length - 1; ii >= 0; ii--) {
          ch = subpicture.charAt(ii);
          if (activeChars.indexOf(ch) !== -1 && ch !== properties['exponent-separator']) {
            return subpicture.substring(ii + 1);
          }
        }
        return "";
      }();
      var activePart = subpicture.substring(prefix.length, subpicture.length - suffix.length);
      var mantissaPart, exponentPart, integerPart, fractionalPart;
      var exponentPosition = subpicture.indexOf(properties['exponent-separator'], prefix.length);
      if (exponentPosition === -1 || exponentPosition > subpicture.length - suffix.length) {
        mantissaPart = activePart;
        exponentPart = undefined;
      } else {
        mantissaPart = activePart.substring(0, exponentPosition);
        exponentPart = activePart.substring(exponentPosition + 1);
      }
      var decimalPosition = mantissaPart.indexOf(properties['decimal-separator']);
      if (decimalPosition === -1) {
        integerPart = mantissaPart;
        fractionalPart = suffix;
      } else {
        integerPart = mantissaPart.substring(0, decimalPosition);
        fractionalPart = mantissaPart.substring(decimalPosition + 1);
      }
      return {
        prefix: prefix,
        suffix: suffix,
        activePart: activePart,
        mantissaPart: mantissaPart,
        exponentPart: exponentPart,
        integerPart: integerPart,
        fractionalPart: fractionalPart,
        subpicture: subpicture
      };
    };

    // validate the picture string, F&O 4.7.3
    var validate = function validate(parts) {
      var error;
      var ii;
      var subpicture = parts.subpicture;
      var decimalPos = subpicture.indexOf(properties['decimal-separator']);
      if (decimalPos !== subpicture.lastIndexOf(properties['decimal-separator'])) {
        error = 'D3081';
      }
      if (subpicture.indexOf(properties.percent) !== subpicture.lastIndexOf(properties.percent)) {
        error = 'D3082';
      }
      if (subpicture.indexOf(properties['per-mille']) !== subpicture.lastIndexOf(properties['per-mille'])) {
        error = 'D3083';
      }
      if (subpicture.indexOf(properties.percent) !== -1 && subpicture.indexOf(properties['per-mille']) !== -1) {
        error = 'D3084';
      }
      var valid = false;
      for (ii = 0; ii < parts.mantissaPart.length; ii++) {
        var ch = parts.mantissaPart.charAt(ii);
        if (decimalDigitFamily.indexOf(ch) !== -1 || ch === properties.digit) {
          valid = true;
          break;
        }
      }
      if (!valid) {
        error = 'D3085';
      }
      var charTypes = parts.activePart.split('').map(function (_char2) {
        return activeChars.indexOf(_char2) === -1 ? 'p' : 'a';
      }).join('');
      if (charTypes.indexOf('p') !== -1) {
        error = 'D3086';
      }
      if (decimalPos !== -1) {
        if (subpicture.charAt(decimalPos - 1) === properties['grouping-separator'] || subpicture.charAt(decimalPos + 1) === properties['grouping-separator']) {
          error = 'D3087';
        }
      } else if (parts.integerPart.charAt(parts.integerPart.length - 1) === properties['grouping-separator']) {
        error = 'D3088';
      }
      if (subpicture.indexOf(properties['grouping-separator'] + properties['grouping-separator']) !== -1) {
        error = 'D3089';
      }
      var optionalDigitPos = parts.integerPart.indexOf(properties.digit);
      if (optionalDigitPos !== -1 && parts.integerPart.substring(0, optionalDigitPos).split('').filter(function (_char3) {
        return decimalDigitFamily.indexOf(_char3) > -1;
      }).length > 0) {
        error = 'D3090';
      }
      optionalDigitPos = parts.fractionalPart.lastIndexOf(properties.digit);
      if (optionalDigitPos !== -1 && parts.fractionalPart.substring(optionalDigitPos).split('').filter(function (_char4) {
        return decimalDigitFamily.indexOf(_char4) > -1;
      }).length > 0) {
        error = 'D3091';
      }
      var exponentExists = typeof parts.exponentPart === 'string';
      if (exponentExists && parts.exponentPart.length > 0 && (subpicture.indexOf(properties.percent) !== -1 || subpicture.indexOf(properties['per-mille']) !== -1)) {
        error = 'D3092';
      }
      if (exponentExists && (parts.exponentPart.length === 0 || parts.exponentPart.split('').filter(function (_char5) {
        return decimalDigitFamily.indexOf(_char5) === -1;
      }).length > 0)) {
        error = 'D3093';
      }
      if (error) {
        throw {
          code: error,
          stack: new Error().stack
        };
      }
    };

    // analyse the picture string, F&O 4.7.4
    var analyse = function analyse(parts) {
      var getGroupingPositions = function getGroupingPositions(part, toLeft) {
        var positions = [];
        var groupingPosition = part.indexOf(properties['grouping-separator']);
        while (groupingPosition !== -1) {
          var charsToTheRight = (toLeft ? part.substring(0, groupingPosition) : part.substring(groupingPosition)).split('').filter(function (_char6) {
            return decimalDigitFamily.indexOf(_char6) !== -1 || _char6 === properties.digit;
          }).length;
          positions.push(charsToTheRight);
          groupingPosition = parts.integerPart.indexOf(properties['grouping-separator'], groupingPosition + 1);
        }
        return positions;
      };
      var integerPartGroupingPositions = getGroupingPositions(parts.integerPart);
      var regular = function regular(indexes) {
        // are the grouping positions regular? i.e. same interval between each of them
        if (indexes.length === 0) {
          return 0;
        }
        var _gcd = function gcd(a, b) {
          return b === 0 ? a : _gcd(b, a % b);
        };
        // find the greatest common divisor of all the positions
        var factor = indexes.reduce(_gcd);
        // is every position separated by this divisor? If so, it's regular
        for (var index = 1; index <= indexes.length; index++) {
          if (indexes.indexOf(index * factor) === -1) {
            return 0;
          }
        }
        return factor;
      };
      var regularGrouping = regular(integerPartGroupingPositions);
      var fractionalPartGroupingPositions = getGroupingPositions(parts.fractionalPart, true);
      var minimumIntegerPartSize = parts.integerPart.split('').filter(function (_char7) {
        return decimalDigitFamily.indexOf(_char7) !== -1;
      }).length;
      var scalingFactor = minimumIntegerPartSize;
      var fractionalPartArray = parts.fractionalPart.split('');
      var minimumFactionalPartSize = fractionalPartArray.filter(function (_char8) {
        return decimalDigitFamily.indexOf(_char8) !== -1;
      }).length;
      var maximumFactionalPartSize = fractionalPartArray.filter(function (_char9) {
        return decimalDigitFamily.indexOf(_char9) !== -1 || _char9 === properties.digit;
      }).length;
      var exponentPresent = typeof parts.exponentPart === 'string';
      if (minimumIntegerPartSize === 0 && maximumFactionalPartSize === 0) {
        if (exponentPresent) {
          minimumFactionalPartSize = 1;
          maximumFactionalPartSize = 1;
        } else {
          minimumIntegerPartSize = 1;
        }
      }
      if (exponentPresent && minimumIntegerPartSize === 0 && parts.integerPart.indexOf(properties.digit) !== -1) {
        minimumIntegerPartSize = 1;
      }
      if (minimumIntegerPartSize === 0 && minimumFactionalPartSize === 0) {
        minimumFactionalPartSize = 1;
      }
      var minimumExponentSize = 0;
      if (exponentPresent) {
        minimumExponentSize = parts.exponentPart.split('').filter(function (_char0) {
          return decimalDigitFamily.indexOf(_char0) !== -1;
        }).length;
      }
      return {
        integerPartGroupingPositions: integerPartGroupingPositions,
        regularGrouping: regularGrouping,
        minimumIntegerPartSize: minimumIntegerPartSize,
        scalingFactor: scalingFactor,
        prefix: parts.prefix,
        fractionalPartGroupingPositions: fractionalPartGroupingPositions,
        minimumFactionalPartSize: minimumFactionalPartSize,
        maximumFactionalPartSize: maximumFactionalPartSize,
        minimumExponentSize: minimumExponentSize,
        suffix: parts.suffix,
        picture: parts.subpicture
      };
    };
    var parts = subPictures.map(splitParts);
    parts.forEach(validate);
    var variables = parts.map(analyse);
    var minus_sign = properties['minus-sign'];
    var zero_digit = properties['zero-digit'];
    var decimal_separator = properties['decimal-separator'];
    var grouping_separator = properties['grouping-separator'];
    if (variables.length === 1) {
      variables.push(JSON.parse(JSON.stringify(variables[0])));
      variables[1].prefix = minus_sign + variables[1].prefix;
    }

    // TODO cache the result of the analysis

    // format the number
    // bullet 1: TODO: NaN - not sure we'd ever get this in JSON
    var pic;
    // bullet 2:
    if (value >= 0) {
      pic = variables[0];
    } else {
      pic = variables[1];
    }
    var adjustedNumber;
    // bullet 3:
    if (pic.picture.indexOf(properties.percent) !== -1) {
      adjustedNumber = value * 100;
    } else if (pic.picture.indexOf(properties['per-mille']) !== -1) {
      adjustedNumber = value * 1000;
    } else {
      adjustedNumber = value;
    }
    // bullet 4:
    // TODO: infinity - not sure we'd ever get this in JSON
    // bullet 5:
    var mantissa, exponent;
    if (pic.minimumExponentSize === 0) {
      mantissa = adjustedNumber;
    } else {
      // mantissa * 10^exponent = adjustedNumber
      var maxMantissa = Math.pow(10, pic.scalingFactor);
      var minMantissa = Math.pow(10, pic.scalingFactor - 1);
      mantissa = adjustedNumber;
      exponent = 0;
      // Compare magnitudes; previously `mantissa < minMantissa` was
      // true for every negative mantissa and `0 * 10 === 0` never
      // crossed the threshold, producing an infinite loop on zero
      // and negative inputs (#785). For zero the desired exponent is
      // simply zero — the XPath F&O Bullet 5 says "if N is zero, set
      // M to zero and E to zero".
      if (mantissa !== 0) {
        while (Math.abs(mantissa) < minMantissa) {
          mantissa *= 10;
          exponent -= 1;
        }
        while (Math.abs(mantissa) > maxMantissa) {
          mantissa /= 10;
          exponent += 1;
        }
      }
    }
    // bullet 6:
    var roundedNumber = round(mantissa, pic.maximumFactionalPartSize);
    // bullet 7:
    var makeString = function makeString(value, dp) {
      var str = Math.abs(value).toFixed(dp);
      if (zero_digit !== '0') {
        str = str.split('').map(function (digit) {
          if (digit >= '0' && digit <= '9') {
            return decimalDigitFamily[digit.charCodeAt(0) - 48];
          } else {
            return digit;
          }
        }).join('');
      }
      return str;
    };
    var stringValue = makeString(roundedNumber, pic.maximumFactionalPartSize);
    var decimalPos = stringValue.indexOf('.');
    if (decimalPos === -1) {
      stringValue = stringValue + decimal_separator;
    } else {
      stringValue = stringValue.replace('.', decimal_separator);
    }
    while (stringValue.charAt(0) === zero_digit) {
      stringValue = stringValue.substring(1);
    }
    while (stringValue.charAt(stringValue.length - 1) === zero_digit) {
      stringValue = stringValue.substring(0, stringValue.length - 1);
    }
    // bullets 8 & 9:
    decimalPos = stringValue.indexOf(decimal_separator);
    var padLeft = pic.minimumIntegerPartSize - decimalPos;
    var padRight = pic.minimumFactionalPartSize - (stringValue.length - decimalPos - 1);
    stringValue = (padLeft > 0 ? new Array(padLeft + 1).join(zero_digit) : '') + stringValue;
    stringValue = stringValue + (padRight > 0 ? new Array(padRight + 1).join(zero_digit) : '');
    decimalPos = stringValue.indexOf(decimal_separator);
    // bullet 10:
    if (pic.regularGrouping > 0) {
      var groupCount = Math.floor((decimalPos - 1) / pic.regularGrouping);
      for (var group = 1; group <= groupCount; group++) {
        stringValue = [stringValue.slice(0, decimalPos - group * pic.regularGrouping), grouping_separator, stringValue.slice(decimalPos - group * pic.regularGrouping)].join('');
      }
    } else {
      pic.integerPartGroupingPositions.forEach(function (pos) {
        stringValue = [stringValue.slice(0, decimalPos - pos), grouping_separator, stringValue.slice(decimalPos - pos)].join('');
        decimalPos++;
      });
    }
    // bullet 11:
    decimalPos = stringValue.indexOf(decimal_separator);
    pic.fractionalPartGroupingPositions.forEach(function (pos) {
      stringValue = [stringValue.slice(0, pos + decimalPos + 1), grouping_separator, stringValue.slice(pos + decimalPos + 1)].join('');
    });
    // bullet 12:
    decimalPos = stringValue.indexOf(decimal_separator);
    if (pic.picture.indexOf(decimal_separator) === -1 || decimalPos === stringValue.length - 1) {
      stringValue = stringValue.substring(0, stringValue.length - 1);
    }
    // bullet 13:
    if (typeof exponent !== 'undefined') {
      var stringExponent = makeString(exponent, 0);
      padLeft = pic.minimumExponentSize - stringExponent.length;
      if (padLeft > 0) {
        stringExponent = new Array(padLeft + 1).join(zero_digit) + stringExponent;
      }
      stringValue = stringValue + properties['exponent-separator'] + (exponent < 0 ? minus_sign : '') + stringExponent;
    }
    // bullet 14:
    stringValue = pic.prefix + stringValue + pic.suffix;
    return stringValue;
  }

  /**
   * Converts a number to a string using a specified number base
   * @param {number} value - the number to convert
   * @param {number} [radix] - the number base; must be between 2 and 36. Defaults to 10
   * @returns {string} - the converted string
   */
  function formatBase(value, radix) {
    // undefined inputs always return undefined
    if (typeof value === 'undefined') {
      return undefined;
    }
    value = round(value);
    if (typeof radix === 'undefined') {
      radix = 10;
    } else {
      radix = round(radix);
    }
    if (radix < 2 || radix > 36) {
      throw {
        code: 'D3100',
        stack: new Error().stack,
        value: radix
      };
    }
    var result = value.toString(radix);
    return result;
  }

  /**
   * Cast argument to number
   * @param {Object} arg - Argument
   * @returns {Number} numeric value of argument
   */
  function number(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    if (typeof arg === 'number') {
      // already a number
      result = arg;
    } else if (typeof arg === 'string' && /^-?[0-9]+(\.[0-9]+)?([Ee][-+]?[0-9]+)?$/.test(arg) && !isNaN(parseFloat(arg)) && isFinite(arg)) {
      result = parseFloat(arg);
    } else if (typeof arg === 'string' && /^(0[xX][0-9A-Fa-f]+)|(0[oO][0-7]+)|(0[bB][0-1]+)$/.test(arg)) {
      result = Number(arg);
    } else if (arg === true) {
      // boolean true casts to 1
      result = 1;
    } else if (arg === false) {
      // boolean false casts to 0
      result = 0;
    } else {
      throw {
        code: "D3030",
        value: arg,
        stack: new Error().stack,
        index: 1
      };
    }
    return result;
  }

  /**
   * Absolute value of a number
   * @param {Number} arg - Argument
   * @returns {Number} absolute value of argument
   */
  function abs(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.abs(arg);
    return result;
  }

  /**
   * Rounds a number down to integer
   * @param {Number} arg - Argument
   * @returns {Number} rounded integer
   */
  function floor(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.floor(arg);
    return result;
  }

  /**
   * Rounds a number up to integer
   * @param {Number} arg - Argument
   * @returns {Number} rounded integer
   */
  function ceil(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.ceil(arg);
    return result;
  }

  /**
   * Round to half even
   * @param {Number} arg - Argument
   * @param {Number} [precision] - number of decimal places
   * @returns {Number} rounded integer
   */
  function round(arg, precision) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    if (precision) {
      // shift the decimal place - this needs to be done in a string since multiplying
      // by a power of ten can introduce floating point precision errors which mess up
      // this rounding algorithm - See 'Decimal rounding' in
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
      // Shift
      var value = arg.toString().split('e');
      arg = +(value[0] + 'e' + (value[1] ? +value[1] + precision : precision));
    }

    // round up to nearest int
    result = Math.round(arg);
    var diff = result - arg;
    if (Math.abs(diff) === 0.5 && Math.abs(result % 2) === 1) {
      // rounded the wrong way - adjust to nearest even number
      result = result - 1;
    }
    if (precision) {
      // Shift back
      value = result.toString().split('e');
      /* istanbul ignore next */
      result = +(value[0] + 'e' + (value[1] ? +value[1] - precision : -precision));
    }
    if (Object.is(result, -0)) {
      // ESLint rule 'no-compare-neg-zero' suggests this way
      // JSON doesn't do -0
      result = 0;
    }
    return result;
  }

  /**
   * Square root of number
   * @param {Number} arg - Argument
   * @returns {Number} square root
   */
  function sqrt(arg) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    if (arg < 0) {
      throw {
        stack: new Error().stack,
        code: "D3060",
        index: 1,
        value: arg
      };
    }
    result = Math.sqrt(arg);
    return result;
  }

  /**
   * Raises number to the power of the second number
   * @param {Number} arg - the base
   * @param {Number} exp - the exponent
   * @returns {Number} rounded integer
   */
  function power(arg, exp) {
    var result;

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    result = Math.pow(arg, exp);
    if (!isFinite(result)) {
      throw {
        stack: new Error().stack,
        code: "D3061",
        index: 1,
        value: arg,
        exp: exp
      };
    }
    return result;
  }

  /**
   * Returns a random number 0 <= n < 1
   * @returns {number} random number
   */
  function random() {
    return Math.random();
  }

  /**
   * Evaluate an input and return a boolean
   * @param {*} arg - Arguments
   * @returns {boolean} Boolean
   */
  function _boolean(arg) {
    // cast arg to its effective boolean value
    // boolean: unchanged
    // string: zero-length -> false; otherwise -> true
    // number: 0 -> false; otherwise -> true
    // null -> false
    // array: empty -> false; length > 1 -> true
    // object: empty -> false; non-empty -> true
    // function -> false

    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    var result = false;
    if (Array.isArray(arg)) {
      if (arg.length === 1) {
        result = _boolean(arg[0]);
      } else if (arg.length > 1) {
        var trues = arg.filter(function (val) {
          return _boolean(val);
        });
        result = trues.length > 0;
      }
    } else if (typeof arg === 'string') {
      if (arg.length > 0) {
        result = true;
      }
    } else if (isNumeric(arg)) {
      if (arg !== 0) {
        result = true;
      }
    } else if (arg !== null && _typeof(arg) === 'object' && !isFunction(arg)) {
      if (Object.keys(arg).length > 0) {
        result = true;
      }
    } else if (typeof arg === 'boolean' && arg === true) {
      result = true;
    }
    return result;
  }

  /**
   * returns the Boolean NOT of the arg
   * @param {*} arg - argument
   * @returns {boolean} - NOT arg
   */
  function not(arg) {
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    return !_boolean(arg);
  }

  /**
   * Helper function to build the arguments to be supplied to the function arg of the
   * HOFs map, filter, each, sift and single
   * @param {function} func - the function to be invoked
   * @param {*} arg1 - the first (required) arg - the value
   * @param {*} arg2 - the second (optional) arg - the position (index or key)
   * @param {*} arg3 - the third (optional) arg - the whole structure (array or object)
   * @returns {*[]} the argument list
   */
  function hofFuncArgs(func, arg1, arg2, arg3) {
    var func_args = [arg1]; // the first arg (the value) is required
    // the other two are optional - only supply it if the function can take it
    var length = getFunctionArity(func);
    if (length >= 2) {
      func_args.push(arg2);
    }
    if (length >= 3) {
      func_args.push(arg3);
    }
    return func_args;
  }

  /**
   * Create a map from an array of arguments
   * @param {Array} [arr] - array to map over
   * @param {Function} func - function to apply
   * @returns {Array} Map array
   */
  function map(_x13, _x14) {
    return _map.apply(this, arguments);
  }
  /**
   * Create a map from an array of arguments
   * @param {Array} [arr] - array to filter
   * @param {Function} func - predicate function
   * @returns {Array} Map array
   */
  function _map() {
    _map = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(arr, func) {
      var result, i, func_args, res;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context6.n = 1;
              break;
            }
            return _context6.a(2, undefined);
          case 1:
            result = this.createSequence(); // do the map - iterate over the arrays, and invoke func
            i = 0;
          case 2:
            if (!(i < arr.length)) {
              _context6.n = 5;
              break;
            }
            func_args = hofFuncArgs(func, arr[i], i, arr); // invoke func
            _context6.n = 3;
            return func.apply(this, func_args);
          case 3:
            res = _context6.v;
            if (typeof res !== 'undefined') {
              result.push(res);
            }
          case 4:
            i++;
            _context6.n = 2;
            break;
          case 5:
            return _context6.a(2, result);
        }
      }, _callee6, this);
    }));
    return _map.apply(this, arguments);
  }
  function filter(_x15, _x16) {
    return _filter.apply(this, arguments);
  }
  /**
   * Given an array, find the single element matching a specified condition
   * Throws an exception if the number of matching elements is not exactly one
   * @param {Array} [arr] - array to filter
   * @param {Function} [func] - predicate function
   * @returns {*} Matching element
   */
  function _filter() {
    _filter = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(arr, func) {
      var result, i, entry, func_args, res;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.n) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2, undefined);
          case 1:
            result = this.createSequence();
            i = 0;
          case 2:
            if (!(i < arr.length)) {
              _context7.n = 5;
              break;
            }
            entry = arr[i];
            func_args = hofFuncArgs(func, entry, i, arr); // invoke func
            _context7.n = 3;
            return func.apply(this, func_args);
          case 3:
            res = _context7.v;
            if (_boolean(res)) {
              result.push(entry);
            }
          case 4:
            i++;
            _context7.n = 2;
            break;
          case 5:
            return _context7.a(2, result);
        }
      }, _callee7, this);
    }));
    return _filter.apply(this, arguments);
  }
  function single(_x17, _x18) {
    return _single.apply(this, arguments);
  }
  /**
   * Convolves (zips) each value from a set of arrays
   * @param {Array} [args] - arrays to zip
   * @returns {Array} Zipped array
   */
  function _single() {
    _single = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(arr, func) {
      var hasFoundMatch, result, i, entry, positiveResult, func_args, res;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.n) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context8.n = 1;
              break;
            }
            return _context8.a(2, undefined);
          case 1:
            hasFoundMatch = false;
            i = 0;
          case 2:
            if (!(i < arr.length)) {
              _context8.n = 7;
              break;
            }
            entry = arr[i];
            positiveResult = true;
            if (!(typeof func !== 'undefined')) {
              _context8.n = 4;
              break;
            }
            func_args = hofFuncArgs(func, entry, i, arr); // invoke func
            _context8.n = 3;
            return func.apply(this, func_args);
          case 3:
            res = _context8.v;
            positiveResult = _boolean(res);
          case 4:
            if (!positiveResult) {
              _context8.n = 6;
              break;
            }
            if (hasFoundMatch) {
              _context8.n = 5;
              break;
            }
            result = entry;
            hasFoundMatch = true;
            _context8.n = 6;
            break;
          case 5:
            throw {
              stack: new Error().stack,
              code: "D3138",
              index: i
            };
          case 6:
            i++;
            _context8.n = 2;
            break;
          case 7:
            if (hasFoundMatch) {
              _context8.n = 8;
              break;
            }
            throw {
              stack: new Error().stack,
              code: "D3139"
            };
          case 8:
            return _context8.a(2, result);
        }
      }, _callee8, this);
    }));
    return _single.apply(this, arguments);
  }
  function zip() {
    // this can take a variable number of arguments
    var result = [];
    var args = Array.prototype.slice.call(arguments);
    // length of the shortest array
    var length = Math.min.apply(Math, args.map(function (arg) {
      if (Array.isArray(arg)) {
        return arg.length;
      }
      return 0;
    }));
    for (var i = 0; i < length; i++) {
      var tuple = args.map(function (arg) {
        return arg[i];
      });
      result.push(tuple);
    }
    return result;
  }

  /**
   * Fold left function
   * @param {Array} sequence - Sequence
   * @param {Function} func - Function
   * @param {Object} init - Initial value
   * @returns {*} Result
   */
  function foldLeft(_x19, _x20, _x21) {
    return _foldLeft.apply(this, arguments);
  }
  /**
   * Return keys for an object
   * @param {Object} arg - Object
   * @returns {Array} Array of keys
   */
  function _foldLeft() {
    _foldLeft = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(sequence, func, init) {
      var result, arity, index, args;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            if (!(typeof sequence === 'undefined')) {
              _context9.n = 1;
              break;
            }
            return _context9.a(2, undefined);
          case 1:
            arity = getFunctionArity(func);
            if (!(arity < 2)) {
              _context9.n = 2;
              break;
            }
            throw {
              stack: new Error().stack,
              code: "D3050",
              index: 1
            };
          case 2:
            if (typeof init === 'undefined' && sequence.length > 0) {
              result = sequence[0];
              index = 1;
            } else {
              result = init;
              index = 0;
            }
          case 3:
            if (!(index < sequence.length)) {
              _context9.n = 5;
              break;
            }
            args = [result, sequence[index]];
            if (arity >= 3) {
              args.push(index);
            }
            if (arity >= 4) {
              args.push(sequence);
            }
            _context9.n = 4;
            return func.apply(this, args);
          case 4:
            result = _context9.v;
            index++;
            _context9.n = 3;
            break;
          case 5:
            return _context9.a(2, result);
        }
      }, _callee9, this);
    }));
    return _foldLeft.apply(this, arguments);
  }
  function keys(arg) {
    var result = this.createSequence();
    if (Array.isArray(arg)) {
      // merge the keys of all of the items in the array
      var merge = Object.create(null);
      for (var ii = 0; ii < arg.length; ii++) {
        var allkeys = keys.call(this, arg[ii]);
        allkeys.forEach(function (key) {
          merge[key] = true;
        });
      }
      result = keys.call(this, merge);
    } else if (arg !== null && _typeof(arg) === 'object' && !isFunction(arg)) {
      Object.keys(arg).forEach(function (key) {
        return result.push(key);
      });
    }
    return result;
  }

  /**
   * Return value from an object for a given key
   * @param {Object} input - Object/Array
   * @param {String} key - Key in object
   * @returns {*} Value of key in object
   */
  function lookup(input, key) {
    // lookup the 'name' item in the input
    var result;
    if (Array.isArray(input)) {
      result = this.createSequence();
      for (var ii = 0; ii < input.length; ii++) {
        var res = lookup.call(this, input[ii], key);
        if (typeof res !== 'undefined') {
          if (Array.isArray(res)) {
            res.forEach(function (val) {
              return result.push(val);
            });
          } else {
            result.push(res);
          }
        }
      }
    } else if (input !== null && _typeof(input) === 'object' && Object.prototype.hasOwnProperty.call(input, key) && !isFunction(input)) {
      result = input[key];
    }
    return result;
  }

  /**
   * Append second argument to first
   * @param {Array|Object} arg1 - First argument
   * @param {Array|Object} arg2 - Second argument
   * @returns {*} Appended arguments
   */
  function append(arg1, arg2) {
    // disregard undefined args
    if (typeof arg1 === 'undefined') {
      return arg2;
    }
    if (typeof arg2 === 'undefined') {
      return arg1;
    }
    // if either argument is not an array, make it so
    if (!Array.isArray(arg1)) {
      arg1 = this.createSequence(arg1);
    }
    if (!Array.isArray(arg2)) {
      arg2 = [arg2];
    }
    var size = arg1.length + arg2.length;
    if (this.options && size > this.options.sequence) {
      throw {
        code: "D2015",
        stack: new Error().stack,
        value: size
      };
    }
    return arg1.concat(arg2);
  }

  /**
   * Determines if the argument is undefined
   * @param {*} arg - argument
   * @returns {boolean} False if argument undefined, otherwise true
   */
  function exists(arg) {
    if (typeof arg === 'undefined') {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Splits an object into an array of object with one property each
   * @param {*} arg - the object to split
   * @returns {*} - the array
   */
  function spread(arg) {
    var result = this.createSequence();
    if (Array.isArray(arg)) {
      // spread all of the items in the array
      for (var ii = 0; ii < arg.length; ii++) {
        result = append.call(this, result, spread.call(this, arg[ii]));
      }
    } else if (arg !== null && _typeof(arg) === 'object' && !isLambda(arg)) {
      for (var _i = 0, _Object$keys = Object.keys(arg); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        var obj = Object.create(null);
        obj[key] = arg[key];
        result.push(obj);
      }
    } else {
      result = arg;
    }
    return result;
  }

  /**
   * Merges an array of objects into a single object.  Duplicate properties are
   * overridden by entries later in the array
   * @param {*} arg - the objects to merge
   * @returns {*} - the object
   */
  function merge(arg) {
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    var result = Object.create(null);
    arg.forEach(function (obj) {
      for (var _i2 = 0, _Object$keys2 = Object.keys(obj); _i2 < _Object$keys2.length; _i2++) {
        var prop = _Object$keys2[_i2];
        result[prop] = obj[prop];
      }
    });
    return result;
  }

  /**
   * Reverses the order of items in an array
   * @param {Array} arr - the array to reverse
   * @returns {Array} - the reversed array
   */
  function reverse(arr) {
    // undefined inputs always return undefined
    if (typeof arr === 'undefined') {
      return undefined;
    }
    if (arr.length <= 1) {
      return arr;
    }
    var length = arr.length;
    var result = new Array(length);
    for (var i = 0; i < length; i++) {
      result[length - i - 1] = arr[i];
    }
    return result;
  }

  /**
   *
   * @param {*} obj - the input object to iterate over
   * @param {*} func - the function to apply to each key/value pair
   * @returns {Array} - the resultant array
   */
  function each(_x22, _x23) {
    return _each.apply(this, arguments);
  }
  /**
   *
   * @param {string} [message] - the message to attach to the error
   * @throws custom error with code 'D3137'
   */
  function _each() {
    _each = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(obj, func) {
      var result, _i3, _Object$keys3, key, func_args, val;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.n) {
          case 0:
            result = this.createSequence();
            _i3 = 0, _Object$keys3 = Object.keys(obj);
          case 1:
            if (!(_i3 < _Object$keys3.length)) {
              _context0.n = 4;
              break;
            }
            key = _Object$keys3[_i3];
            func_args = hofFuncArgs(func, obj[key], key, obj); // invoke func
            _context0.n = 2;
            return func.apply(this, func_args);
          case 2:
            val = _context0.v;
            if (typeof val !== 'undefined') {
              result.push(val);
            }
          case 3:
            _i3++;
            _context0.n = 1;
            break;
          case 4:
            return _context0.a(2, result);
        }
      }, _callee0, this);
    }));
    return _each.apply(this, arguments);
  }
  function error(message) {
    throw {
      code: "D3137",
      stack: new Error().stack,
      message: message || "$error() function evaluated"
    };
  }

  /**
   *
   * @param {boolean} condition - the condition to evaluate
   * @param {string} [message] - the message to attach to the error
   * @throws custom error with code 'D3137'
   * @returns {undefined}
   */
  function assert(condition, message) {
    if (!condition) {
      throw {
        code: "D3141",
        stack: new Error().stack,
        message: message || "$assert() statement failed"
      };
    }
    return undefined;
  }

  /**
   *
   * @param {*} [value] - the input to which the type will be checked
   * @returns {string} - the type of the input
   */
  function type(value) {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return 'null';
    }
    if (isNumeric(value)) {
      return 'number';
    }
    if (typeof value === 'string') {
      return 'string';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    if (isFunction(value)) {
      return 'function';
    }
    return 'object';
  }

  /**
   * Implements the merge sort (stable) with optional comparator function
   *
   * @param {Array} arr - the array to sort
   * @param {*} comparator - comparator function
   * @returns {Array} - sorted array
   */
  function sort(_x24, _x25) {
    return _sort.apply(this, arguments);
  }
  /**
   * Randomly shuffles the contents of an array
   * @param {Array} arr - the input array
   * @returns {Array} the shuffled array
   */
  function _sort() {
    _sort = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(arr, comparator) {
      var comp, merge, _msort, result;
      return _regenerator().w(function (_context13) {
        while (1) switch (_context13.n) {
          case 0:
            if (!(typeof arr === 'undefined')) {
              _context13.n = 1;
              break;
            }
            return _context13.a(2, undefined);
          case 1:
            if (!(arr.length <= 1)) {
              _context13.n = 2;
              break;
            }
            return _context13.a(2, arr);
          case 2:
            if (!(typeof comparator === 'undefined')) {
              _context13.n = 4;
              break;
            }
            if (!(!isArrayOfNumbers(arr) && !isArrayOfStrings(arr))) {
              _context13.n = 3;
              break;
            }
            throw {
              stack: new Error().stack,
              code: "D3070",
              index: 1
            };
          case 3:
            comp = /*#__PURE__*/function () {
              var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(a, b) {
                return _regenerator().w(function (_context1) {
                  while (1) switch (_context1.n) {
                    case 0:
                      return _context1.a(2, a > b);
                  }
                }, _callee1);
              }));
              return function comp(_x28, _x29) {
                return _ref.apply(this, arguments);
              };
            }();
            _context13.n = 5;
            break;
          case 4:
            // for internal usage of functionSort (i.e. order-by syntax)
            comp = comparator;
          case 5:
            merge = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(l, r) {
                var _merge_iter, merged;
                return _regenerator().w(function (_context11) {
                  while (1) switch (_context11.n) {
                    case 0:
                      _merge_iter = /*#__PURE__*/function () {
                        var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(result, left, right) {
                          return _regenerator().w(function (_context10) {
                            while (1) switch (_context10.n) {
                              case 0:
                                if (!(left.length === 0)) {
                                  _context10.n = 1;
                                  break;
                                }
                                Array.prototype.push.apply(result, right);
                                _context10.n = 6;
                                break;
                              case 1:
                                if (!(right.length === 0)) {
                                  _context10.n = 2;
                                  break;
                                }
                                Array.prototype.push.apply(result, left);
                                _context10.n = 6;
                                break;
                              case 2:
                                _context10.n = 3;
                                return comp(left[0], right[0]);
                              case 3:
                                if (!_context10.v) {
                                  _context10.n = 5;
                                  break;
                                }
                                // invoke the comparator function
                                // if it returns true - swap left and right
                                result.push(right[0]);
                                _context10.n = 4;
                                return _merge_iter(result, left, right.slice(1));
                              case 4:
                                _context10.n = 6;
                                break;
                              case 5:
                                // otherwise keep the same order
                                result.push(left[0]);
                                _context10.n = 6;
                                return _merge_iter(result, left.slice(1), right);
                              case 6:
                                return _context10.a(2);
                            }
                          }, _callee10);
                        }));
                        return function merge_iter(_x32, _x33, _x34) {
                          return _ref3.apply(this, arguments);
                        };
                      }();
                      merged = [];
                      _context11.n = 1;
                      return _merge_iter(merged, l, r);
                    case 1:
                      return _context11.a(2, merged);
                  }
                }, _callee11);
              }));
              return function merge(_x30, _x31) {
                return _ref2.apply(this, arguments);
              };
            }();
            _msort = /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(array) {
                var middle, left, right;
                return _regenerator().w(function (_context12) {
                  while (1) switch (_context12.n) {
                    case 0:
                      if (!(!Array.isArray(array) || array.length <= 1)) {
                        _context12.n = 1;
                        break;
                      }
                      return _context12.a(2, array);
                    case 1:
                      middle = Math.floor(array.length / 2);
                      left = array.slice(0, middle);
                      right = array.slice(middle);
                      _context12.n = 2;
                      return _msort(left);
                    case 2:
                      left = _context12.v;
                      _context12.n = 3;
                      return _msort(right);
                    case 3:
                      right = _context12.v;
                      _context12.n = 4;
                      return merge(left, right);
                    case 4:
                      return _context12.a(2, _context12.v);
                    case 5:
                      return _context12.a(2);
                  }
                }, _callee12);
              }));
              return function msort(_x35) {
                return _ref4.apply(this, arguments);
              };
            }();
            _context13.n = 6;
            return _msort(arr);
          case 6:
            result = _context13.v;
            return _context13.a(2, result);
        }
      }, _callee13);
    }));
    return _sort.apply(this, arguments);
  }
  function shuffle(arr) {
    // undefined inputs always return undefined
    if (typeof arr === 'undefined') {
      return undefined;
    }
    if (arr.length <= 1) {
      return arr;
    }

    // shuffle using the 'inside-out' variant of the Fisher-Yates algorithm
    var result = new Array(arr.length);
    for (var i = 0; i < arr.length; i++) {
      var j = Math.floor(Math.random() * (i + 1)); // random integer such that 0 ≤ j ≤ i
      if (i !== j) {
        result[i] = result[j];
      }
      result[j] = arr[i];
    }
    return result;
  }

  /**
   * Returns the values that appear in a sequence, with duplicates eliminated.
   * @param {Array} arr - An array or sequence of values
   * @returns {Array} - sequence of distinct values
   */
  function distinct(arr) {
    // undefined inputs always return undefined
    if (typeof arr === 'undefined') {
      return undefined;
    }
    if (!Array.isArray(arr) || arr.length <= 1) {
      return arr;
    }
    var results = isSequence(arr) ? this.createSequence() : [];
    for (var ii = 0; ii < arr.length; ii++) {
      var value = arr[ii];
      // is this value already in the result sequence?
      var includes = false;
      for (var jj = 0; jj < results.length; jj++) {
        if (deepEquals(value, results[jj])) {
          includes = true;
          break;
        }
      }
      if (!includes) {
        results.push(value);
      }
    }
    return results;
  }

  /**
   * Applies a predicate function to each key/value pair in an object, and returns an object containing
   * only the key/value pairs that passed the predicate
   *
   * @param {object} arg - the object to be sifted
   * @param {object} func - the predicate function (lambda or native)
   * @returns {object} - sifted object
   */
  function sift(_x26, _x27) {
    return _sift.apply(this, arguments);
  }
  function _sift() {
    _sift = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(arg, func) {
      var result, _i4, _Object$keys4, item, entry, func_args, res;
      return _regenerator().w(function (_context14) {
        while (1) switch (_context14.n) {
          case 0:
            result = Object.create(null);
            _i4 = 0, _Object$keys4 = Object.keys(arg);
          case 1:
            if (!(_i4 < _Object$keys4.length)) {
              _context14.n = 4;
              break;
            }
            item = _Object$keys4[_i4];
            entry = arg[item];
            func_args = hofFuncArgs(func, entry, item, arg); // invoke func
            _context14.n = 2;
            return func.apply(this, func_args);
          case 2:
            res = _context14.v;
            if (_boolean(res)) {
              result[item] = entry;
            }
          case 3:
            _i4++;
            _context14.n = 1;
            break;
          case 4:
            // empty objects should be changed to undefined
            if (Object.keys(result).length === 0) {
              result = undefined;
            }
            return _context14.a(2, result);
        }
      }, _callee14, this);
    }));
    return _sift.apply(this, arguments);
  }
  return {
    sum: sum,
    count: count,
    max: max,
    min: min,
    average: average,
    string: string,
    substring: substring,
    substringBefore: substringBefore,
    substringAfter: substringAfter,
    lowercase: lowercase,
    uppercase: uppercase,
    length: length,
    trim: trim,
    pad: pad,
    match: match,
    contains: contains,
    replace: replace,
    split: split,
    join: join,
    formatNumber: formatNumber,
    formatBase: formatBase,
    number: number,
    floor: floor,
    ceil: ceil,
    round: round,
    abs: abs,
    sqrt: sqrt,
    power: power,
    random: random,
    "boolean": _boolean,
    not: not,
    map: map,
    zip: zip,
    filter: filter,
    single: single,
    foldLeft: foldLeft,
    sift: sift,
    keys: keys,
    lookup: lookup,
    append: append,
    exists: exists,
    spread: spread,
    merge: merge,
    reverse: reverse,
    each: each,
    error: error,
    assert: assert,
    type: type,
    sort: sort,
    shuffle: shuffle,
    distinct: distinct,
    base64encode: base64encode,
    base64decode: base64decode,
    encodeUrlComponent: encodeUrlComponent,
    encodeUrl: encodeUrl,
    decodeUrlComponent: decodeUrlComponent,
    decodeUrl: decodeUrl
  };
}();
module.exports = functions;