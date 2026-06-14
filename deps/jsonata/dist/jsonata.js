"use strict";

function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * © Copyright IBM Corp. 2016, 2017 All Rights Reserved
 *   Project name: JSONata
 *   This project is licensed under the MIT License, see LICENSE
 */

/**
 * @module JSONata
 * @description JSON query and transformation language
 */

var datetime = require('./datetime');
var fn = require('./functions');
var utils = require('./utils');
var parser = require('./parser');
var parseSignature = require('./signature');

/**
 * jsonata
 * @function
 * @param {Object} expr - JSONata expression
 * @returns {{evaluate: evaluate, assign: assign}} Evaluated expression
 */
var jsonata = function () {
  'use strict';

  var isNumeric = utils.isNumeric;
  var isArrayOfStrings = utils.isArrayOfStrings;
  var isArrayOfNumbers = utils.isArrayOfNumbers;
  var isSequence = utils.isSequence;
  var isFunction = utils.isFunction;
  var isLambda = utils.isLambda;
  var isIterable = utils.isIterable;
  var isPromise = utils.isPromise;
  var getFunctionArity = utils.getFunctionArity;
  var isDeepEqual = utils.isDeepEqual;

  // Start of Evaluator code

  var staticFrame = createFrame(null);

  /**
   * Evaluate expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluate2(_x, _x2, _x3) {
    return _evaluate.apply(this, arguments);
  }
  /**
   * Evaluate path expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluate() {
    _evaluate = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(expr, input, environment) {
      var result, entryCallback, ii, exitCallback, _t2;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            environment.base.depth++;
            environment.base.guardrails();
            entryCallback = environment.lookup(Symbol["for"]('jsonata.__evaluate_entry'));
            if (!entryCallback) {
              _context4.n = 1;
              break;
            }
            _context4.n = 1;
            return entryCallback(expr, input, environment);
          case 1:
            _t2 = expr.type;
            _context4.n = _t2 === 'path' ? 2 : _t2 === 'binary' ? 4 : _t2 === 'unary' ? 6 : _t2 === 'name' ? 8 : _t2 === 'string' ? 9 : _t2 === 'number' ? 9 : _t2 === 'value' ? 9 : _t2 === 'wildcard' ? 10 : _t2 === 'descendant' ? 11 : _t2 === 'parent' ? 12 : _t2 === 'condition' ? 13 : _t2 === 'block' ? 15 : _t2 === 'bind' ? 17 : _t2 === 'regex' ? 19 : _t2 === 'function' ? 20 : _t2 === 'variable' ? 22 : _t2 === 'lambda' ? 23 : _t2 === 'partial' ? 24 : _t2 === 'apply' ? 26 : _t2 === 'transform' ? 28 : 29;
            break;
          case 2:
            _context4.n = 3;
            return evaluatePath(expr, input, environment);
          case 3:
            result = _context4.v;
            return _context4.a(3, 29);
          case 4:
            _context4.n = 5;
            return evaluateBinary(expr, input, environment);
          case 5:
            result = _context4.v;
            return _context4.a(3, 29);
          case 6:
            _context4.n = 7;
            return evaluateUnary(expr, input, environment);
          case 7:
            result = _context4.v;
            return _context4.a(3, 29);
          case 8:
            result = evaluateName(expr, input, environment);
            return _context4.a(3, 29);
          case 9:
            result = evaluateLiteral(expr, input, environment);
            return _context4.a(3, 29);
          case 10:
            result = evaluateWildcard(expr, input, environment);
            return _context4.a(3, 29);
          case 11:
            result = evaluateDescendants(expr, input, environment);
            return _context4.a(3, 29);
          case 12:
            result = environment.lookup(expr.slot.label);
            return _context4.a(3, 29);
          case 13:
            _context4.n = 14;
            return evaluateCondition(expr, input, environment);
          case 14:
            result = _context4.v;
            return _context4.a(3, 29);
          case 15:
            _context4.n = 16;
            return evaluateBlock(expr, input, environment);
          case 16:
            result = _context4.v;
            return _context4.a(3, 29);
          case 17:
            _context4.n = 18;
            return evaluateBindExpression(expr, input, environment);
          case 18:
            result = _context4.v;
            return _context4.a(3, 29);
          case 19:
            result = evaluateRegex(expr, input, environment);
            return _context4.a(3, 29);
          case 20:
            _context4.n = 21;
            return evaluateFunction(expr, input, environment);
          case 21:
            result = _context4.v;
            return _context4.a(3, 29);
          case 22:
            result = evaluateVariable(expr, input, environment);
            return _context4.a(3, 29);
          case 23:
            result = evaluateLambda(expr, input, environment);
            return _context4.a(3, 29);
          case 24:
            _context4.n = 25;
            return evaluatePartialApplication(expr, input, environment);
          case 25:
            result = _context4.v;
            return _context4.a(3, 29);
          case 26:
            _context4.n = 27;
            return evaluateApplyExpression(expr, input, environment);
          case 27:
            result = _context4.v;
            return _context4.a(3, 29);
          case 28:
            result = evaluateTransformExpression(expr, input, environment);
            return _context4.a(3, 29);
          case 29:
            if (!Object.prototype.hasOwnProperty.call(expr, 'predicate')) {
              _context4.n = 33;
              break;
            }
            ii = 0;
          case 30:
            if (!(ii < expr.predicate.length)) {
              _context4.n = 33;
              break;
            }
            _context4.n = 31;
            return evaluateFilter(expr.predicate[ii].expr, result, environment);
          case 31:
            result = _context4.v;
          case 32:
            ii++;
            _context4.n = 30;
            break;
          case 33:
            if (!(expr.type !== 'path' && Object.prototype.hasOwnProperty.call(expr, 'group'))) {
              _context4.n = 35;
              break;
            }
            _context4.n = 34;
            return evaluateGroupExpression(expr.group, result, environment);
          case 34:
            result = _context4.v;
          case 35:
            exitCallback = environment.lookup(Symbol["for"]('jsonata.__evaluate_exit'));
            if (!exitCallback) {
              _context4.n = 36;
              break;
            }
            _context4.n = 36;
            return exitCallback(expr, input, environment, result);
          case 36:
            if (result && isSequence(result) && !result.tupleStream) {
              if (expr.keepArray) {
                result.keepSingleton = true;
              }
              if (result.length === 0) {
                result = undefined;
              } else if (result.length === 1) {
                result = result.keepSingleton ? result : result[0];
              }
            }
            environment.base.depth--;
            return _context4.a(2, result);
        }
      }, _callee4);
    }));
    return _evaluate.apply(this, arguments);
  }
  function evaluatePath(_x4, _x5, _x6) {
    return _evaluatePath.apply(this, arguments);
  }
  function _evaluatePath() {
    _evaluatePath = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(expr, input, environment) {
      var inputSequence, resultSequence, isTupleStream, tupleBindings, ii, step;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            // expr is an array of steps
            // if the first step is a variable reference ($...), including root reference ($$),
            //   then the path is absolute rather than relative
            if (Array.isArray(input) && expr.steps[0].type !== 'variable') {
              inputSequence = input;
            } else {
              // if input is not an array, make it so
              inputSequence = environment.base.createSequence(input);
            }
            isTupleStream = false;
            tupleBindings = undefined; // evaluate each step in turn
            ii = 0;
          case 1:
            if (!(ii < expr.steps.length)) {
              _context5.n = 10;
              break;
            }
            step = expr.steps[ii];
            if (step.tuple) {
              isTupleStream = true;
            }

            // if the first step is an explicit array constructor, then just evaluate that (i.e. don't iterate over a context array)
            if (!(ii === 0 && step.consarray)) {
              _context5.n = 3;
              break;
            }
            _context5.n = 2;
            return _evaluate2(step, inputSequence, environment);
          case 2:
            resultSequence = _context5.v;
            _context5.n = 7;
            break;
          case 3:
            if (!isTupleStream) {
              _context5.n = 5;
              break;
            }
            _context5.n = 4;
            return evaluateTupleStep(step, inputSequence, tupleBindings, environment);
          case 4:
            tupleBindings = _context5.v;
            _context5.n = 7;
            break;
          case 5:
            _context5.n = 6;
            return evaluateStep(step, inputSequence, environment, ii === expr.steps.length - 1);
          case 6:
            resultSequence = _context5.v;
          case 7:
            if (!(!isTupleStream && (typeof resultSequence === 'undefined' || resultSequence.length === 0))) {
              _context5.n = 8;
              break;
            }
            return _context5.a(3, 10);
          case 8:
            if (typeof step.focus === 'undefined') {
              inputSequence = resultSequence;
            }
          case 9:
            ii++;
            _context5.n = 1;
            break;
          case 10:
            if (isTupleStream) {
              if (expr.tuple) {
                // tuple stream is carrying ancestry information - keep this
                resultSequence = tupleBindings;
              } else {
                resultSequence = environment.base.createSequence();
                for (ii = 0; ii < tupleBindings.length; ii++) {
                  resultSequence.push(tupleBindings[ii]['@']);
                }
              }
            }
            if (expr.keepSingletonArray) {
              // if the array is explicitly constructed in the expression and marked to promote singleton sequences to array
              if (Array.isArray(resultSequence) && resultSequence.cons && !resultSequence.sequence) {
                resultSequence = environment.base.createSequence(resultSequence);
              }
              resultSequence.keepSingleton = true;
            }
            if (!Object.prototype.hasOwnProperty.call(expr, 'group')) {
              _context5.n = 12;
              break;
            }
            _context5.n = 11;
            return evaluateGroupExpression(expr.group, isTupleStream ? tupleBindings : resultSequence, environment);
          case 11:
            resultSequence = _context5.v;
          case 12:
            return _context5.a(2, resultSequence);
        }
      }, _callee5);
    }));
    return _evaluatePath.apply(this, arguments);
  }
  function createFrameFromTuple(environment, tuple) {
    var frame = createFrame(environment);
    for (var _i = 0, _Object$keys = Object.keys(tuple); _i < _Object$keys.length; _i++) {
      var prop = _Object$keys[_i];
      frame.bind(prop, tuple[prop]);
    }
    return frame;
  }

  /**
   * Evaluate a step within a path
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @param {boolean} lastStep - flag the last step in a path
   * @returns {*} Evaluated input data
   */
  function evaluateStep(_x7, _x8, _x9, _x0) {
    return _evaluateStep.apply(this, arguments);
  }
  function _evaluateStep() {
    _evaluateStep = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(expr, input, environment, lastStep) {
      var result, ii, res, ss, resultSequence;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            if (!(expr.type === 'sort')) {
              _context6.n = 4;
              break;
            }
            _context6.n = 1;
            return evaluateSortExpression(expr, input, environment);
          case 1:
            result = _context6.v;
            if (!expr.stages) {
              _context6.n = 3;
              break;
            }
            _context6.n = 2;
            return evaluateStages(expr.stages, result, environment);
          case 2:
            result = _context6.v;
          case 3:
            return _context6.a(2, result);
          case 4:
            result = environment.base.createSequence();
            ii = 0;
          case 5:
            if (!(ii < input.length)) {
              _context6.n = 12;
              break;
            }
            _context6.n = 6;
            return _evaluate2(expr, input[ii], environment);
          case 6:
            res = _context6.v;
            if (!expr.stages) {
              _context6.n = 10;
              break;
            }
            ss = 0;
          case 7:
            if (!(ss < expr.stages.length)) {
              _context6.n = 10;
              break;
            }
            _context6.n = 8;
            return evaluateFilter(expr.stages[ss].expr, res, environment);
          case 8:
            res = _context6.v;
          case 9:
            ss++;
            _context6.n = 7;
            break;
          case 10:
            if (typeof res !== 'undefined') {
              result.push(res);
            }
          case 11:
            ii++;
            _context6.n = 5;
            break;
          case 12:
            resultSequence = environment.base.createSequence();
            if (lastStep && result.length === 1 && Array.isArray(result[0]) && !isSequence(result[0])) {
              resultSequence = result[0];
            } else {
              // flatten the sequence
              Array.prototype.forEach.call(result, function (res) {
                if (!Array.isArray(res) || res.cons) {
                  // it's not an array - just push into the result sequence
                  resultSequence.push(res);
                } else {
                  // res is a sequence - flatten it into the parent sequence
                  Array.prototype.forEach.call(res, function (val) {
                    return resultSequence.push(val);
                  });
                }
              });
            }
            return _context6.a(2, resultSequence);
        }
      }, _callee6);
    }));
    return _evaluateStep.apply(this, arguments);
  }
  function evaluateStages(_x1, _x10, _x11) {
    return _evaluateStages.apply(this, arguments);
  }
  /**
   * Evaluate a step within a path
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} tupleBindings - The tuple stream
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateStages() {
    _evaluateStages = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(stages, input, environment) {
      var result, ss, stage, ee, tuple, _t3;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.n) {
          case 0:
            result = input;
            ss = 0;
          case 1:
            if (!(ss < stages.length)) {
              _context7.n = 6;
              break;
            }
            stage = stages[ss];
            _t3 = stage.type;
            _context7.n = _t3 === 'filter' ? 2 : _t3 === 'index' ? 4 : 5;
            break;
          case 2:
            _context7.n = 3;
            return evaluateFilter(stage.expr, result, environment);
          case 3:
            result = _context7.v;
            return _context7.a(3, 5);
          case 4:
            for (ee = 0; ee < result.length; ee++) {
              tuple = result[ee];
              tuple[stage.value] = ee;
            }
            return _context7.a(3, 5);
          case 5:
            ss++;
            _context7.n = 1;
            break;
          case 6:
            return _context7.a(2, result);
        }
      }, _callee7);
    }));
    return _evaluateStages.apply(this, arguments);
  }
  function evaluateTupleStep(_x12, _x13, _x14, _x15) {
    return _evaluateTupleStep.apply(this, arguments);
  }
  /**
   * Apply filter predicate to input data
   * @param {Object} predicate - filter expression
   * @param {Object} input - Input data to apply predicates against
   * @param {Object} environment - Environment
   * @returns {*} Result after applying predicates
   */
  function _evaluateTupleStep() {
    _evaluateTupleStep = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(expr, input, tupleBindings, environment) {
      var result, sorted, ss, tuple, stepEnv, ee, res, bb;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.n) {
          case 0:
            if (!(expr.type === 'sort')) {
              _context8.n = 7;
              break;
            }
            if (!tupleBindings) {
              _context8.n = 2;
              break;
            }
            _context8.n = 1;
            return evaluateSortExpression(expr, tupleBindings, environment);
          case 1:
            result = _context8.v;
            _context8.n = 4;
            break;
          case 2:
            _context8.n = 3;
            return evaluateSortExpression(expr, input, environment);
          case 3:
            sorted = _context8.v;
            result = environment.base.createSequence();
            result.tupleStream = true;
            for (ss = 0; ss < sorted.length; ss++) {
              tuple = {
                '@': sorted[ss]
              };
              tuple[expr.index] = ss;
              result.push(tuple);
            }
          case 4:
            if (!expr.stages) {
              _context8.n = 6;
              break;
            }
            _context8.n = 5;
            return evaluateStages(expr.stages, result, environment);
          case 5:
            result = _context8.v;
          case 6:
            return _context8.a(2, result);
          case 7:
            result = environment.base.createSequence();
            result.tupleStream = true;
            stepEnv = environment;
            if (tupleBindings === undefined) {
              tupleBindings = input.map(function (item) {
                return {
                  '@': item
                };
              });
            }
            ee = 0;
          case 8:
            if (!(ee < tupleBindings.length)) {
              _context8.n = 11;
              break;
            }
            stepEnv = createFrameFromTuple(environment, tupleBindings[ee]);
            _context8.n = 9;
            return _evaluate2(expr, tupleBindings[ee]['@'], stepEnv);
          case 9:
            res = _context8.v;
            // res is the binding sequence for the output tuple stream
            if (typeof res !== 'undefined') {
              if (!Array.isArray(res)) {
                res = [res];
              }
              for (bb = 0; bb < res.length; bb++) {
                tuple = Object.create(null);
                Object.assign(tuple, tupleBindings[ee]);
                if (res.tupleStream) {
                  Object.assign(tuple, res[bb]);
                } else {
                  if (expr.focus) {
                    tuple[expr.focus] = res[bb];
                    tuple['@'] = tupleBindings[ee]['@'];
                  } else {
                    tuple['@'] = res[bb];
                  }
                  if (expr.index) {
                    tuple[expr.index] = bb;
                  }
                  if (expr.ancestor) {
                    tuple[expr.ancestor.label] = tupleBindings[ee]['@'];
                  }
                }
                result.push(tuple);
              }
            }
          case 10:
            ee++;
            _context8.n = 8;
            break;
          case 11:
            if (!expr.stages) {
              _context8.n = 13;
              break;
            }
            _context8.n = 12;
            return evaluateStages(expr.stages, result, environment);
          case 12:
            result = _context8.v;
          case 13:
            return _context8.a(2, result);
        }
      }, _callee8);
    }));
    return _evaluateTupleStep.apply(this, arguments);
  }
  function evaluateFilter(_x16, _x17, _x18) {
    return _evaluateFilter.apply(this, arguments);
  }
  /**
   * Evaluate binary expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateFilter() {
    _evaluateFilter = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(predicate, input, environment) {
      var results, index, item, context, env, res;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            results = environment.base.createSequence();
            if (input && input.tupleStream) {
              results.tupleStream = true;
            }
            if (!Array.isArray(input)) {
              input = environment.base.createSequence(input);
            }
            if (!(predicate.type === 'number')) {
              _context9.n = 2;
              break;
            }
            index = Math.floor(predicate.value); // round it down
            if (index < 0) {
              // count in from end of array
              index = input.length + index;
            }
            _context9.n = 1;
            return input[index];
          case 1:
            item = _context9.v;
            if (typeof item !== 'undefined') {
              if (Array.isArray(item)) {
                results = item;
              } else {
                results.push(item);
              }
            }
            _context9.n = 6;
            break;
          case 2:
            index = 0;
          case 3:
            if (!(index < input.length)) {
              _context9.n = 6;
              break;
            }
            item = input[index];
            context = item;
            env = environment;
            if (input.tupleStream) {
              context = item['@'];
              env = createFrameFromTuple(environment, item);
            }
            _context9.n = 4;
            return _evaluate2(predicate, context, env);
          case 4:
            res = _context9.v;
            if (isNumeric(res)) {
              res = [res];
            }
            if (isArrayOfNumbers(res)) {
              Array.prototype.forEach.call(res, function (ires) {
                // round it down
                var ii = Math.floor(ires);
                if (ii < 0) {
                  // count in from end of array
                  ii = input.length + ii;
                }
                if (ii === index) {
                  results.push(item);
                }
              });
            } else if (fn["boolean"](res)) {
              // truthy
              results.push(item);
            }
          case 5:
            index++;
            _context9.n = 3;
            break;
          case 6:
            return _context9.a(2, results);
        }
      }, _callee9);
    }));
    return _evaluateFilter.apply(this, arguments);
  }
  function evaluateBinary(_x19, _x20, _x21) {
    return _evaluateBinary.apply(this, arguments);
  }
  /**
   * Evaluate unary expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateBinary() {
    _evaluateBinary = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(expr, input, environment) {
      var result, lhs, op, evalrhs, rhs, _t4, _t5, _t6;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            _context1.n = 1;
            return _evaluate2(expr.lhs, input, environment);
          case 1:
            lhs = _context1.v;
            op = expr.value; //defer evaluation of RHS to allow short-circuiting
            evalrhs = /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
                return _regenerator().w(function (_context0) {
                  while (1) switch (_context0.n) {
                    case 0:
                      _context0.n = 1;
                      return _evaluate2(expr.rhs, input, environment);
                    case 1:
                      return _context0.a(2, _context0.v);
                  }
                }, _callee0);
              }));
              return function evalrhs() {
                return _ref3.apply(this, arguments);
              };
            }();
            if (!(op === "and" || op === "or")) {
              _context1.n = 5;
              break;
            }
            _context1.p = 2;
            _context1.n = 3;
            return evaluateBooleanExpression(lhs, evalrhs, op);
          case 3:
            return _context1.a(2, _context1.v);
          case 4:
            _context1.p = 4;
            _t4 = _context1.v;
            _t4.position = expr.position;
            _t4.token = op;
            throw _t4;
          case 5:
            _context1.n = 6;
            return evalrhs();
          case 6:
            rhs = _context1.v;
            _context1.p = 7;
            _t5 = op;
            _context1.n = _t5 === '+' ? 8 : _t5 === '-' ? 8 : _t5 === '*' ? 8 : _t5 === '/' ? 8 : _t5 === '%' ? 8 : _t5 === '=' ? 9 : _t5 === '!=' ? 9 : _t5 === '<' ? 10 : _t5 === '<=' ? 10 : _t5 === '>' ? 10 : _t5 === '>=' ? 10 : _t5 === '&' ? 11 : _t5 === '..' ? 12 : _t5 === 'in' ? 13 : 14;
            break;
          case 8:
            result = evaluateNumericExpression(lhs, rhs, op);
            return _context1.a(3, 14);
          case 9:
            result = evaluateEqualityExpression(lhs, rhs, op);
            return _context1.a(3, 14);
          case 10:
            result = evaluateComparisonExpression(lhs, rhs, op);
            return _context1.a(3, 14);
          case 11:
            result = evaluateStringConcat(lhs, rhs);
            return _context1.a(3, 14);
          case 12:
            result = evaluateRangeExpression(lhs, rhs, environment);
            return _context1.a(3, 14);
          case 13:
            result = evaluateIncludesExpression(lhs, rhs);
            return _context1.a(3, 14);
          case 14:
            _context1.n = 16;
            break;
          case 15:
            _context1.p = 15;
            _t6 = _context1.v;
            _t6.position = expr.position;
            _t6.token = op;
            throw _t6;
          case 16:
            return _context1.a(2, result);
        }
      }, _callee1, null, [[7, 15], [2, 4]]);
    }));
    return _evaluateBinary.apply(this, arguments);
  }
  function evaluateUnary(_x22, _x23, _x24) {
    return _evaluateUnary.apply(this, arguments);
  }
  /**
   * Evaluate name object against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateUnary() {
    _evaluateUnary = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(expr, input, environment) {
      var result, focus, generators, _iterator, _step, generator, _generator, item, value, _t9;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.n) {
          case 0:
            focus = {
              options: environment.base.options,
              createSequence: environment.base.createSequence
            };
            _t9 = expr.value;
            _context11.n = _t9 === '-' ? 1 : _t9 === '[' ? 6 : _t9 === '{' ? 8 : 10;
            break;
          case 1:
            _context11.n = 2;
            return _evaluate2(expr.expression, input, environment);
          case 2:
            result = _context11.v;
            if (!(typeof result === 'undefined')) {
              _context11.n = 3;
              break;
            }
            result = undefined;
            _context11.n = 5;
            break;
          case 3:
            if (!isNumeric(result)) {
              _context11.n = 4;
              break;
            }
            result = -result;
            _context11.n = 5;
            break;
          case 4:
            throw {
              code: "D1002",
              stack: new Error().stack,
              position: expr.position,
              token: expr.value,
              value: result
            };
          case 5:
            return _context11.a(3, 10);
          case 6:
            // array constructor - evaluate each item
            result = [];
            _context11.n = 7;
            return Promise.all(expr.expressions.map(/*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(item, idx) {
                var _t7, _t8;
                return _regenerator().w(function (_context10) {
                  while (1) switch (_context10.n) {
                    case 0:
                      environment.isParallelCall = idx > 0;
                      _t7 = item;
                      _context10.n = 1;
                      return _evaluate2(item, input, environment);
                    case 1:
                      _t8 = _context10.v;
                      return _context10.a(2, [_t7, _t8]);
                  }
                }, _callee10);
              }));
              return function (_x73, _x74) {
                return _ref4.apply(this, arguments);
              };
            }()));
          case 7:
            generators = _context11.v;
            _iterator = _createForOfIteratorHelper(generators);
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                generator = _step.value;
                _generator = _slicedToArray(generator, 2), item = _generator[0], value = _generator[1];
                if (typeof value !== 'undefined') {
                  if (item.value === '[') {
                    result.push(value);
                  } else {
                    result = fn.append.call(focus, result, value);
                  }
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            if (expr.consarray) {
              Object.defineProperty(result, 'cons', {
                enumerable: false,
                configurable: false,
                value: true
              });
            }
            return _context11.a(3, 10);
          case 8:
            _context11.n = 9;
            return evaluateGroupExpression(expr, input, environment);
          case 9:
            result = _context11.v;
            return _context11.a(3, 10);
          case 10:
            return _context11.a(2, result);
        }
      }, _callee11);
    }));
    return _evaluateUnary.apply(this, arguments);
  }
  function evaluateName(expr, input, environment) {
    // lookup the 'name' item in the input
    var focus = {
      createSequence: environment.base.createSequence
    };
    return fn.lookup.call(focus, input, expr.value);
  }

  /**
   * Evaluate literal against input data
   * @param {Object} expr - JSONata expression
   * @returns {*} Evaluated input data
   */
  function evaluateLiteral(expr) {
    return expr.value;
  }

  /**
   * Evaluate wildcard against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @returns {*} Evaluated input data
   */
  function evaluateWildcard(expr, input, environment) {
    var focus = {
      options: environment.base.options,
      createSequence: environment.base.createSequence
    };
    var results = focus.createSequence();
    if (Array.isArray(input) && input.outerWrapper && input.length > 0) {
      input = input[0];
    }
    if (input !== null && _typeof(input) === 'object' && !isFunction(input)) {
      Object.keys(input).forEach(function (key) {
        var value = input[key];
        if (Array.isArray(value)) {
          value = flatten(value);
          results = fn.append.call(focus, results, value);
        } else {
          results.push(value);
        }
      });
    }

    //        result = normalizeSequence(results);
    return results;
  }

  /**
   * Returns a flattened array
   * @param {Array} arg - the array to be flatten
   * @param {Array} flattened - carries the flattened array - if not defined, will initialize to []
   * @returns {Array} - the flattened array
   */
  function flatten(arg, flattened) {
    if (typeof flattened === 'undefined') {
      flattened = [];
    }
    if (Array.isArray(arg)) {
      Array.prototype.forEach.call(arg, function (item) {
        flatten(item, flattened);
      });
    } else {
      flattened.push(arg);
    }
    return flattened;
  }

  /**
   * Evaluate descendants against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @returns {*} Evaluated input data
   */
  function evaluateDescendants(expr, input, environment) {
    var result;
    var resultSequence = environment.base.createSequence();
    if (typeof input !== 'undefined') {
      // traverse all descendants of this object/array
      recurseDescendants(input, resultSequence);
      if (resultSequence.length === 1) {
        result = resultSequence[0];
      } else {
        result = resultSequence;
      }
    }
    return result;
  }

  /**
   * Recurse through descendants
   * @param {Object} input - Input data
   * @param {Object} results - Results
   */
  function recurseDescendants(input, results) {
    // this is the equivalent of //* in XPath
    if (!Array.isArray(input)) {
      results.push(input);
    }
    if (Array.isArray(input)) {
      Array.prototype.forEach.call(input, function (member) {
        recurseDescendants(member, results);
      });
    } else if (input !== null && _typeof(input) === 'object' && !isFunction(input)) {
      Object.keys(input).forEach(function (key) {
        recurseDescendants(input[key], results);
      });
    }
  }

  /**
   * Evaluate numeric expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateNumericExpression(lhs, rhs, op) {
    var result;
    if (typeof lhs !== 'undefined' && !isNumeric(lhs)) {
      throw {
        code: "T2001",
        stack: new Error().stack,
        value: lhs
      };
    }
    if (typeof rhs !== 'undefined' && !isNumeric(rhs)) {
      throw {
        code: "T2002",
        stack: new Error().stack,
        value: rhs
      };
    }
    if (typeof lhs === 'undefined' || typeof rhs === 'undefined') {
      // if either side is undefined, the result is undefined
      return result;
    }
    switch (op) {
      case '+':
        result = lhs + rhs;
        break;
      case '-':
        result = lhs - rhs;
        break;
      case '*':
        result = lhs * rhs;
        break;
      case '/':
        result = lhs / rhs;
        break;
      case '%':
        result = lhs % rhs;
        break;
    }
    return result;
  }

  /**
   * Evaluate equality expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateEqualityExpression(lhs, rhs, op) {
    var result;

    // type checks
    var ltype = _typeof(lhs);
    var rtype = _typeof(rhs);
    if (ltype === 'undefined' || rtype === 'undefined') {
      // if either side is undefined, the result is false
      return false;
    }
    switch (op) {
      case '=':
        result = isDeepEqual(lhs, rhs);
        break;
      case '!=':
        result = !isDeepEqual(lhs, rhs);
        break;
    }
    return result;
  }

  /**
   * Evaluate comparison expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateComparisonExpression(lhs, rhs, op) {
    var result;

    // type checks
    var ltype = _typeof(lhs);
    var rtype = _typeof(rhs);
    var lcomparable = ltype === 'undefined' || ltype === 'string' || ltype === 'number';
    var rcomparable = rtype === 'undefined' || rtype === 'string' || rtype === 'number';

    // if either aa or bb are not comparable (string or numeric) values, then throw an error
    if (!lcomparable || !rcomparable) {
      throw {
        code: "T2010",
        stack: new Error().stack,
        value: !(ltype === 'string' || ltype === 'number') ? lhs : rhs
      };
    }

    // if either side is undefined, the result is undefined
    if (ltype === 'undefined' || rtype === 'undefined') {
      return undefined;
    }

    //if aa and bb are not of the same type
    if (ltype !== rtype) {
      throw {
        code: "T2009",
        stack: new Error().stack,
        value: lhs,
        value2: rhs
      };
    }
    switch (op) {
      case '<':
        result = lhs < rhs;
        break;
      case '<=':
        result = lhs <= rhs;
        break;
      case '>':
        result = lhs > rhs;
        break;
      case '>=':
        result = lhs >= rhs;
        break;
    }
    return result;
  }

  /**
   * Inclusion operator - in
   *
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @returns {boolean} - true if lhs is a member of rhs
   */
  function evaluateIncludesExpression(lhs, rhs) {
    var result = false;
    if (typeof lhs === 'undefined' || typeof rhs === 'undefined') {
      // if either side is undefined, the result is false
      return false;
    }
    if (!Array.isArray(rhs)) {
      rhs = [rhs];
    }
    for (var i = 0; i < rhs.length; i++) {
      if (rhs[i] === lhs) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * Evaluate boolean expression against input data
   * @param {Object} lhs - LHS value
   * @param {Function} evalrhs - function to evaluate RHS value
   * @param {Object} op - opcode
   * @returns {*} Result
   */
  function evaluateBooleanExpression(_x25, _x26, _x27) {
    return _evaluateBooleanExpression.apply(this, arguments);
  }
  function _evaluateBooleanExpression() {
    _evaluateBooleanExpression = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(lhs, evalrhs, op) {
      var result, lBool, _t0, _t1, _t10, _t11, _t12;
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.n) {
          case 0:
            lBool = boolize(lhs);
            _t0 = op;
            _context12.n = _t0 === 'and' ? 1 : _t0 === 'or' ? 4 : 7;
            break;
          case 1:
            _t1 = lBool;
            if (!_t1) {
              _context12.n = 3;
              break;
            }
            _t10 = boolize;
            _context12.n = 2;
            return evalrhs();
          case 2:
            _t1 = _t10(_context12.v);
          case 3:
            result = _t1;
            return _context12.a(3, 7);
          case 4:
            _t11 = lBool;
            if (_t11) {
              _context12.n = 6;
              break;
            }
            _t12 = boolize;
            _context12.n = 5;
            return evalrhs();
          case 5:
            _t11 = _t12(_context12.v);
          case 6:
            result = _t11;
            return _context12.a(3, 7);
          case 7:
            return _context12.a(2, result);
        }
      }, _callee12);
    }));
    return _evaluateBooleanExpression.apply(this, arguments);
  }
  function boolize(value) {
    var booledValue = fn["boolean"](value);
    return typeof booledValue === 'undefined' ? false : booledValue;
  }

  /**
   * Evaluate string concatenation against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @returns {string|*} Concatenated string
   */
  function evaluateStringConcat(lhs, rhs) {
    var result;
    var lstr = '';
    var rstr = '';
    if (typeof lhs !== 'undefined') {
      lstr = fn.string(lhs);
    }
    if (typeof rhs !== 'undefined') {
      rstr = fn.string(rhs);
    }
    result = lstr.concat(rstr);
    return result;
  }

  /**
   * Evaluate group expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {{}} Evaluated input data
   */
  function evaluateGroupExpression(_x28, _x29, _x30) {
    return _evaluateGroupExpression.apply(this, arguments);
  }
  function _evaluateGroupExpression() {
    _evaluateGroupExpression = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(expr, input, environment) {
      var result, groups, reduce, focus, itemIndex, item, env, pairIndex, pair, key, entry, generators, _iterator2, _step2, generator, _yield$generator, _yield$generator2, value, _t15;
      return _regenerator().w(function (_context14) {
        while (1) switch (_context14.p = _context14.n) {
          case 0:
            result = Object.create(null);
            groups = Object.create(null);
            reduce = input && input.tupleStream ? true : false;
            focus = {
              options: environment.base.options,
              createSequence: environment.base.createSequence
            }; // group the input sequence by 'key' expression
            if (!Array.isArray(input)) {
              options: environment.base.options, input = focus.createSequence(input);
            }
            // if the array is empty, add an undefined entry to enable literal JSON object to be generated
            if (input.length === 0) {
              input.push(undefined);
            }
            itemIndex = 0;
          case 1:
            if (!(itemIndex < input.length)) {
              _context14.n = 10;
              break;
            }
            item = input[itemIndex];
            env = reduce ? createFrameFromTuple(environment, item) : environment;
            pairIndex = 0;
          case 2:
            if (!(pairIndex < expr.lhs.length)) {
              _context14.n = 9;
              break;
            }
            pair = expr.lhs[pairIndex];
            _context14.n = 3;
            return _evaluate2(pair[0], reduce ? item['@'] : item, env);
          case 3:
            key = _context14.v;
            if (!(typeof key !== 'string' && key !== undefined)) {
              _context14.n = 4;
              break;
            }
            throw {
              code: "T1003",
              stack: new Error().stack,
              position: expr.position,
              value: key
            };
          case 4:
            if (!(key !== undefined)) {
              _context14.n = 8;
              break;
            }
            if (!(key === '_jsonata_lambda' || key === '_jsonata_function')) {
              _context14.n = 5;
              break;
            }
            throw {
              code: "D1013",
              stack: new Error().stack,
              position: expr.position,
              value: key
            };
          case 5:
            entry = {
              data: item,
              exprIndex: pairIndex
            };
            if (!Object.prototype.hasOwnProperty.call(groups, key)) {
              _context14.n = 7;
              break;
            }
            if (!(groups[key].exprIndex !== pairIndex)) {
              _context14.n = 6;
              break;
            }
            throw {
              code: "D1009",
              stack: new Error().stack,
              position: expr.position,
              value: key
            };
          case 6:
            // append it as an array
            groups[key].data = fn.append.call(focus, groups[key].data, item);
            _context14.n = 8;
            break;
          case 7:
            groups[key] = entry;
          case 8:
            pairIndex++;
            _context14.n = 2;
            break;
          case 9:
            itemIndex++;
            _context14.n = 1;
            break;
          case 10:
            _context14.n = 11;
            return Promise.all(Object.keys(groups).map(/*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(key, idx) {
                var entry, context, env, tuple, _t13, _t14;
                return _regenerator().w(function (_context13) {
                  while (1) switch (_context13.n) {
                    case 0:
                      entry = groups[key];
                      context = entry.data;
                      env = environment;
                      if (reduce) {
                        tuple = reduceTupleStream(entry.data, environment);
                        context = tuple['@'];
                        delete tuple['@'];
                        env = createFrameFromTuple(environment, tuple);
                      }
                      environment.isParallelCall = idx > 0;
                      _t13 = key;
                      _context13.n = 1;
                      return _evaluate2(expr.lhs[entry.exprIndex][1], context, env);
                    case 1:
                      _t14 = _context13.v;
                      return _context13.a(2, [_t13, _t14]);
                  }
                }, _callee13);
              }));
              return function (_x75, _x76) {
                return _ref5.apply(this, arguments);
              };
            }()));
          case 11:
            generators = _context14.v;
            _iterator2 = _createForOfIteratorHelper(generators);
            _context14.p = 12;
            _iterator2.s();
          case 13:
            if ((_step2 = _iterator2.n()).done) {
              _context14.n = 16;
              break;
            }
            generator = _step2.value;
            _context14.n = 14;
            return generator;
          case 14:
            _yield$generator = _context14.v;
            _yield$generator2 = _slicedToArray(_yield$generator, 2);
            key = _yield$generator2[0];
            value = _yield$generator2[1];
            if (typeof value !== 'undefined') {
              result[key] = value;
            }
          case 15:
            _context14.n = 13;
            break;
          case 16:
            _context14.n = 18;
            break;
          case 17:
            _context14.p = 17;
            _t15 = _context14.v;
            _iterator2.e(_t15);
          case 18:
            _context14.p = 18;
            _iterator2.f();
            return _context14.f(18);
          case 19:
            return _context14.a(2, result);
        }
      }, _callee14, null, [[12, 17, 18, 19]]);
    }));
    return _evaluateGroupExpression.apply(this, arguments);
  }
  function reduceTupleStream(tupleStream, environment) {
    if (!Array.isArray(tupleStream)) {
      return tupleStream;
    }
    var result = Object.create(null);
    var focus = {
      options: environment.base.options,
      createSequence: environment.base.createSequence
    };
    Object.assign(result, tupleStream[0]);
    for (var ii = 1; ii < tupleStream.length; ii++) {
      for (var _i2 = 0, _Object$keys2 = Object.keys(tupleStream[ii]); _i2 < _Object$keys2.length; _i2++) {
        var prop = _Object$keys2[_i2];
        result[prop] = fn.append.call(focus, result[prop], tupleStream[ii][prop]);
      }
    }
    return result;
  }

  /**
   * Evaluate range expression against input data
   * @param {Object} lhs - LHS value
   * @param {Object} rhs - RHS value
   * @returns {Array} Resultant array
   */
  function evaluateRangeExpression(lhs, rhs, environment) {
    var result;
    if (typeof lhs !== 'undefined' && !Number.isInteger(lhs)) {
      throw {
        code: "T2003",
        stack: new Error().stack,
        value: lhs
      };
    }
    if (typeof rhs !== 'undefined' && !Number.isInteger(rhs)) {
      throw {
        code: "T2004",
        stack: new Error().stack,
        value: rhs
      };
    }
    if (typeof lhs === 'undefined' || typeof rhs === 'undefined') {
      // if either side is undefined, the result is undefined
      return result;
    }
    if (lhs > rhs) {
      // if the lhs is greater than the rhs, return undefined
      return result;
    }

    // limit the size of the array to ten million entries (1e7)
    // this is an implementation defined limit to protect against
    // memory and performance issues.  This value may increase in the future.
    var size = rhs - lhs + 1;
    if (size > 1e7) {
      throw {
        code: "D2014",
        stack: new Error().stack,
        value: size
      };
    }
    if (environment.base.options && size > environment.base.options.sequence) {
      throw {
        code: "D2015",
        stack: new Error().stack,
        value: size
      };
    }
    result = new Array(size);
    for (var item = lhs, index = 0; item <= rhs; item++, index++) {
      result[index] = item;
    }
    result.sequence = true;
    return result;
  }

  /**
   * Evaluate bind expression against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluateBindExpression(_x31, _x32, _x33) {
    return _evaluateBindExpression.apply(this, arguments);
  }
  /**
   * Evaluate condition against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateBindExpression() {
    _evaluateBindExpression = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(expr, input, environment) {
      var value;
      return _regenerator().w(function (_context15) {
        while (1) switch (_context15.n) {
          case 0:
            _context15.n = 1;
            return _evaluate2(expr.rhs, input, environment);
          case 1:
            value = _context15.v;
            environment.bind(expr.lhs.value, value);
            return _context15.a(2, value);
        }
      }, _callee15);
    }));
    return _evaluateBindExpression.apply(this, arguments);
  }
  function evaluateCondition(_x34, _x35, _x36) {
    return _evaluateCondition.apply(this, arguments);
  }
  /**
   * Evaluate block against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateCondition() {
    _evaluateCondition = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(expr, input, environment) {
      var result, condition;
      return _regenerator().w(function (_context16) {
        while (1) switch (_context16.n) {
          case 0:
            _context16.n = 1;
            return _evaluate2(expr.condition, input, environment);
          case 1:
            condition = _context16.v;
            if (!fn["boolean"](condition)) {
              _context16.n = 3;
              break;
            }
            _context16.n = 2;
            return _evaluate2(expr.then, input, environment);
          case 2:
            result = _context16.v;
            _context16.n = 5;
            break;
          case 3:
            if (!(typeof expr["else"] !== 'undefined')) {
              _context16.n = 5;
              break;
            }
            _context16.n = 4;
            return _evaluate2(expr["else"], input, environment);
          case 4:
            result = _context16.v;
          case 5:
            return _context16.a(2, result);
        }
      }, _callee16);
    }));
    return _evaluateCondition.apply(this, arguments);
  }
  function evaluateBlock(_x37, _x38, _x39) {
    return _evaluateBlock.apply(this, arguments);
  }
  /**
   * Prepare a regex
   * @param {Object} expr - expression containing regex
   * @returns {Function} Higher order function representing prepared regex
   */
  function _evaluateBlock() {
    _evaluateBlock = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(expr, input, environment) {
      var result, frame, ii;
      return _regenerator().w(function (_context17) {
        while (1) switch (_context17.n) {
          case 0:
            // create a new frame to limit the scope of variable assignments
            // TODO, only do this if the post-parse stage has flagged this as required
            frame = createFrame(environment); // invoke each expression in turn
            // only return the result of the last one
            ii = 0;
          case 1:
            if (!(ii < expr.expressions.length)) {
              _context17.n = 4;
              break;
            }
            _context17.n = 2;
            return _evaluate2(expr.expressions[ii], input, frame);
          case 2:
            result = _context17.v;
          case 3:
            ii++;
            _context17.n = 1;
            break;
          case 4:
            return _context17.a(2, result);
        }
      }, _callee17);
    }));
    return _evaluateBlock.apply(this, arguments);
  }
  function evaluateRegex(expr, input, environment) {
    var re = new environment.base.RegexEngine(expr.value);
    var _closure = function closure(str, fromIndex) {
      var result;
      re.lastIndex = fromIndex || 0;
      var match = re.exec(str);
      if (match !== null) {
        result = {
          match: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups: []
        };
        if (match.length > 1) {
          for (var i = 1; i < match.length; i++) {
            result.groups.push(match[i]);
          }
        }
        result.next = function () {
          if (re.lastIndex >= str.length) {
            return undefined;
          } else {
            var next = _closure(str, re.lastIndex);
            if (next && next.match === '') {
              // matches zero length string; this will never progress
              throw {
                code: "D1004",
                stack: new Error().stack,
                position: expr.position,
                value: expr.value.source
              };
            }
            return next;
          }
        };
      }
      return result;
    };
    return _closure;
  }

  /**
   * Evaluate variable against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluateVariable(expr, input, environment) {
    // lookup the variable value in the environment
    var result;
    // if the variable name is empty string, then it refers to context value
    if (expr.value === '') {
      result = input && input.outerWrapper ? input[0] : input;
    } else {
      result = environment.lookup(expr.value);
    }
    return result;
  }

  /**
   * sort / order-by operator
   * @param {Object} expr - AST for operator
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Ordered sequence
   */
  function evaluateSortExpression(_x40, _x41, _x42) {
    return _evaluateSortExpression.apply(this, arguments);
  }
  /**
   * create a transformer function
   * @param {Object} expr - AST for operator
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} tranformer function
   */
  function _evaluateSortExpression() {
    _evaluateSortExpression = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19(expr, input, environment) {
      var result, lhs, isTupleSort, comparator, focus;
      return _regenerator().w(function (_context19) {
        while (1) switch (_context19.n) {
          case 0:
            // evaluate the lhs, then sort the results in order according to rhs expression
            lhs = input;
            isTupleSort = input.tupleStream ? true : false; // sort the lhs array
            // use comparator function
            comparator = /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(a, b) {
                var comp, index, term, context, env, aa, bb, atype, btype;
                return _regenerator().w(function (_context18) {
                  while (1) switch (_context18.n) {
                    case 0:
                      // expr.terms is an array of order-by in priority order
                      comp = 0;
                      index = 0;
                    case 1:
                      if (!(comp === 0 && index < expr.terms.length)) {
                        _context18.n = 11;
                        break;
                      }
                      term = expr.terms[index]; //evaluate the sort term in the context of a
                      context = a;
                      env = environment;
                      if (isTupleSort) {
                        context = a['@'];
                        env = createFrameFromTuple(environment, a);
                      }
                      _context18.n = 2;
                      return _evaluate2(term.expression, context, env);
                    case 2:
                      aa = _context18.v;
                      //evaluate the sort term in the context of b
                      context = b;
                      env = environment;
                      if (isTupleSort) {
                        context = b['@'];
                        env = createFrameFromTuple(environment, b);
                      }
                      _context18.n = 3;
                      return _evaluate2(term.expression, context, env);
                    case 3:
                      bb = _context18.v;
                      // type checks
                      atype = _typeof(aa);
                      btype = _typeof(bb); // undefined should be last in sort order
                      if (!(atype === 'undefined')) {
                        _context18.n = 4;
                        break;
                      }
                      // swap them, unless btype is also undefined
                      comp = btype === 'undefined' ? 0 : 1;
                      return _context18.a(3, 10);
                    case 4:
                      if (!(btype === 'undefined')) {
                        _context18.n = 5;
                        break;
                      }
                      comp = -1;
                      return _context18.a(3, 10);
                    case 5:
                      if (!(!(atype === 'string' || atype === 'number') || !(btype === 'string' || btype === 'number'))) {
                        _context18.n = 6;
                        break;
                      }
                      throw {
                        code: "T2008",
                        stack: new Error().stack,
                        position: expr.position,
                        value: !(atype === 'string' || atype === 'number') ? aa : bb
                      };
                    case 6:
                      if (!(atype !== btype)) {
                        _context18.n = 7;
                        break;
                      }
                      throw {
                        code: "T2007",
                        stack: new Error().stack,
                        position: expr.position,
                        value: aa,
                        value2: bb
                      };
                    case 7:
                      if (!(aa === bb)) {
                        _context18.n = 8;
                        break;
                      }
                      return _context18.a(3, 10);
                    case 8:
                      if (aa < bb) {
                        comp = -1;
                      } else {
                        comp = 1;
                      }
                    case 9:
                      if (term.descending === true) {
                        comp = -comp;
                      }
                    case 10:
                      index++;
                      _context18.n = 1;
                      break;
                    case 11:
                      return _context18.a(2, comp === 1);
                  }
                }, _callee18);
              }));
              return function comparator(_x77, _x78) {
                return _ref6.apply(this, arguments);
              };
            }();
            focus = {
              environment: environment,
              input: input
            }; // the `focus` is passed in as the `this` for the invoked function
            _context19.n = 1;
            return fn.sort.apply(focus, [lhs, comparator]);
          case 1:
            result = _context19.v;
            return _context19.a(2, result);
        }
      }, _callee19);
    }));
    return _evaluateSortExpression.apply(this, arguments);
  }
  function evaluateTransformExpression(expr, input, environment) {
    // create a function to implement the transform definition
    var transformer = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(obj) {
        var cloneFunction, result, matches, ii, match, update, updateType, _i3, _Object$keys3, prop, deletions, val, jj;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (!(typeof obj === 'undefined')) {
                _context.n = 1;
                break;
              }
              return _context.a(2, undefined);
            case 1:
              // this function returns a copy of obj with changes specified by the pattern/operation
              cloneFunction = environment.lookup('clone');
              if (isFunction(cloneFunction)) {
                _context.n = 2;
                break;
              }
              throw {
                code: "T2013",
                stack: new Error().stack,
                position: expr.position
              };
            case 2:
              _context.n = 3;
              return apply(cloneFunction, [obj], null, environment);
            case 3:
              result = _context.v;
              _context.n = 4;
              return _evaluate2(expr.pattern, result, environment);
            case 4:
              matches = _context.v;
              if (!(typeof matches !== 'undefined')) {
                _context.n = 12;
                break;
              }
              if (!Array.isArray(matches)) {
                matches = [matches];
              }
              ii = 0;
            case 5:
              if (!(ii < matches.length)) {
                _context.n = 12;
                break;
              }
              match = matches[ii]; // evaluate the update value for each match
              _context.n = 6;
              return _evaluate2(expr.update, match, environment);
            case 6:
              update = _context.v;
              // update must be an object
              updateType = _typeof(update);
              if (!(updateType !== 'undefined')) {
                _context.n = 8;
                break;
              }
              if (!(updateType !== 'object' || update === null || Array.isArray(update))) {
                _context.n = 7;
                break;
              }
              throw {
                code: "T2011",
                stack: new Error().stack,
                position: expr.update.position,
                value: update
              };
            case 7:
              // merge the update
              for (_i3 = 0, _Object$keys3 = Object.keys(update); _i3 < _Object$keys3.length; _i3++) {
                prop = _Object$keys3[_i3];
                match[prop] = update[prop];
              }
            case 8:
              if (!(typeof expr["delete"] !== 'undefined')) {
                _context.n = 11;
                break;
              }
              _context.n = 9;
              return _evaluate2(expr["delete"], match, environment);
            case 9:
              deletions = _context.v;
              if (!(typeof deletions !== 'undefined')) {
                _context.n = 11;
                break;
              }
              val = deletions;
              if (!Array.isArray(deletions)) {
                deletions = [deletions];
              }
              if (isArrayOfStrings(deletions)) {
                _context.n = 10;
                break;
              }
              throw {
                code: "T2012",
                stack: new Error().stack,
                position: expr["delete"].position,
                value: val
              };
            case 10:
              for (jj = 0; jj < deletions.length; jj++) {
                if (_typeof(match) === 'object' && match !== null) {
                  delete match[deletions[jj]];
                }
              }
            case 11:
              ii++;
              _context.n = 5;
              break;
            case 12:
              return _context.a(2, result);
          }
        }, _callee);
      }));
      return function transformer(_x43) {
        return _ref.apply(this, arguments);
      };
    }();
    return defineFunction(transformer, '<(oa):o>');
  }
  var chainAST = parser('function($f, $g) { function($x){ $g($f($x)) } }');

  /**
   * Apply the function on the RHS using the sequence on the LHS as the first argument
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluateApplyExpression(_x44, _x45, _x46) {
    return _evaluateApplyExpression.apply(this, arguments);
  }
  /**
   * Evaluate function against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function _evaluateApplyExpression() {
    _evaluateApplyExpression = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(expr, input, environment) {
      var result, lhs, func, chain;
      return _regenerator().w(function (_context20) {
        while (1) switch (_context20.n) {
          case 0:
            _context20.n = 1;
            return _evaluate2(expr.lhs, input, environment);
          case 1:
            lhs = _context20.v;
            if (!(expr.rhs.type === 'function')) {
              _context20.n = 3;
              break;
            }
            _context20.n = 2;
            return evaluateFunction(expr.rhs, input, environment, {
              context: lhs
            });
          case 2:
            result = _context20.v;
            _context20.n = 10;
            break;
          case 3:
            _context20.n = 4;
            return _evaluate2(expr.rhs, input, environment);
          case 4:
            func = _context20.v;
            if (isFunction(func)) {
              _context20.n = 5;
              break;
            }
            throw {
              code: "T2006",
              stack: new Error().stack,
              position: expr.position,
              value: func
            };
          case 5:
            if (!isFunction(lhs)) {
              _context20.n = 8;
              break;
            }
            _context20.n = 6;
            return _evaluate2(chainAST, null, environment);
          case 6:
            chain = _context20.v;
            _context20.n = 7;
            return apply(chain, [lhs, func], null, environment);
          case 7:
            result = _context20.v;
            _context20.n = 10;
            break;
          case 8:
            _context20.n = 9;
            return apply(func, [lhs], null, environment);
          case 9:
            result = _context20.v;
          case 10:
            return _context20.a(2, result);
        }
      }, _callee20);
    }));
    return _evaluateApplyExpression.apply(this, arguments);
  }
  function evaluateFunction(_x47, _x48, _x49, _x50) {
    return _evaluateFunction.apply(this, arguments);
  }
  /**
   * Apply procedure or function
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @param {Object} input - input
   * @param {Object} environment - environment
   * @returns {*} Result of procedure
   */
  function _evaluateFunction() {
    _evaluateFunction = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22(expr, input, environment, applyto) {
      var result, proc, evaluatedArgs, _loop, jj, procName, _t16;
      return _regenerator().w(function (_context23) {
        while (1) switch (_context23.p = _context23.n) {
          case 0:
            _context23.n = 1;
            return _evaluate2(expr.procedure, input, environment);
          case 1:
            proc = _context23.v;
            if (!(typeof proc === 'undefined' && expr.procedure.type === 'path' && environment.lookup(expr.procedure.steps[0].value))) {
              _context23.n = 2;
              break;
            }
            throw {
              code: "T1005",
              stack: new Error().stack,
              position: expr.position,
              token: expr.procedure.steps[0].value
            };
          case 2:
            evaluatedArgs = [];
            if (typeof applyto !== 'undefined') {
              evaluatedArgs.push(applyto.context);
            }
            // eager evaluation - evaluate the arguments
            _loop = /*#__PURE__*/_regenerator().m(function _loop() {
              var arg, closure;
              return _regenerator().w(function (_context22) {
                while (1) switch (_context22.n) {
                  case 0:
                    _context22.n = 1;
                    return _evaluate2(expr.arguments[jj], input, environment);
                  case 1:
                    arg = _context22.v;
                    if (isFunction(arg)) {
                      // wrap this in a closure
                      closure = /*#__PURE__*/function () {
                        var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21() {
                          var _len2,
                            params,
                            _key2,
                            _args21 = arguments;
                          return _regenerator().w(function (_context21) {
                            while (1) switch (_context21.n) {
                              case 0:
                                for (_len2 = _args21.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                  params[_key2] = _args21[_key2];
                                }
                                _context21.n = 1;
                                return apply(arg, params, null, environment);
                              case 1:
                                return _context21.a(2, _context21.v);
                            }
                          }, _callee21);
                        }));
                        return function closure() {
                          return _ref7.apply(this, arguments);
                        };
                      }();
                      closure.arity = getFunctionArity(arg);
                      evaluatedArgs.push(closure);
                    } else {
                      evaluatedArgs.push(arg);
                    }
                  case 2:
                    return _context22.a(2);
                }
              }, _loop);
            });
            jj = 0;
          case 3:
            if (!(jj < expr.arguments.length)) {
              _context23.n = 5;
              break;
            }
            return _context23.d(_regeneratorValues(_loop()), 4);
          case 4:
            jj++;
            _context23.n = 3;
            break;
          case 5:
            // apply the procedure
            procName = expr.procedure.type === 'path' ? expr.procedure.steps[0].value : expr.procedure.value;
            _context23.p = 6;
            if (_typeof(proc) === 'object') {
              proc.token = procName;
              proc.position = expr.position;
            }
            _context23.n = 7;
            return apply(proc, evaluatedArgs, input, environment);
          case 7:
            result = _context23.v;
            _context23.n = 9;
            break;
          case 8:
            _context23.p = 8;
            _t16 = _context23.v;
            if (!_t16.position) {
              // add the position field to the error
              _t16.position = expr.position;
            }
            if (!_t16.token) {
              // and the function identifier
              _t16.token = procName;
            }
            throw _t16;
          case 9:
            return _context23.a(2, result);
        }
      }, _callee22, null, [[6, 8]]);
    }));
    return _evaluateFunction.apply(this, arguments);
  }
  function apply(_x51, _x52, _x53, _x54) {
    return _apply.apply(this, arguments);
  }
  /**
   * Apply procedure or function
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @param {Object} input - input
   * @param {Object} environment - environment
   * @returns {*} Result of procedure
   */
  function _apply() {
    _apply = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee23(proc, args, input, environment) {
      var result, next, evaluatedArgs, ii, _t17;
      return _regenerator().w(function (_context24) {
        while (1) switch (_context24.n) {
          case 0:
            _context24.n = 1;
            return applyInner(proc, args, input, environment);
          case 1:
            result = _context24.v;
          case 2:
            if (!(isLambda(result) && result.thunk === true)) {
              _context24.n = 9;
              break;
            }
            _context24.n = 3;
            return _evaluate2(result.body.procedure, result.input, result.environment);
          case 3:
            next = _context24.v;
            if (result.body.procedure.type === 'variable') {
              next.token = result.body.procedure.value;
            }
            next.position = result.body.procedure.position;
            evaluatedArgs = [];
            ii = 0;
          case 4:
            if (!(ii < result.body.arguments.length)) {
              _context24.n = 7;
              break;
            }
            _t17 = evaluatedArgs;
            _context24.n = 5;
            return _evaluate2(result.body.arguments[ii], result.input, result.environment);
          case 5:
            _t17.push.call(_t17, _context24.v);
          case 6:
            ii++;
            _context24.n = 4;
            break;
          case 7:
            _context24.n = 8;
            return applyInner(next, evaluatedArgs, input, environment);
          case 8:
            result = _context24.v;
            _context24.n = 2;
            break;
          case 9:
            return _context24.a(2, result);
        }
      }, _callee23);
    }));
    return _apply.apply(this, arguments);
  }
  function applyInner(_x55, _x56, _x57, _x58) {
    return _applyInner.apply(this, arguments);
  }
  /**
   * Evaluate lambda against input data
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {{lambda: boolean, input: *, environment: *, arguments: *, body: *}} Evaluated input data
   */
  function _applyInner() {
    _applyInner = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee24(proc, args, input, environment) {
      var result, validatedArgs, focus, _t18;
      return _regenerator().w(function (_context25) {
        while (1) switch (_context25.p = _context25.n) {
          case 0:
            _context25.p = 0;
            validatedArgs = args;
            if (proc) {
              validatedArgs = validateArguments(proc.signature, args, input);
            }
            if (!isLambda(proc)) {
              _context25.n = 2;
              break;
            }
            _context25.n = 1;
            return applyProcedure(proc, validatedArgs);
          case 1:
            result = _context25.v;
            _context25.n = 9;
            break;
          case 2:
            if (!(proc && proc._jsonata_function === true)) {
              _context25.n = 5;
              break;
            }
            focus = {
              environment: environment,
              input: input,
              options: environment.base.options,
              createSequence: environment.base.createSequence
            }; // the `focus` is passed in as the `this` for the invoked function
            result = proc.implementation.apply(focus, validatedArgs);
            // `proc.implementation` might be a generator function
            // and `result` might be a generator - if so, yield
            if (isIterable(result)) {
              result = result.next().value;
            }
            if (!isPromise(result)) {
              _context25.n = 4;
              break;
            }
            _context25.n = 3;
            return result;
          case 3:
            result = _context25.v;
          case 4:
            _context25.n = 9;
            break;
          case 5:
            if (!(typeof proc === 'function')) {
              _context25.n = 8;
              break;
            }
            // typically these are functions that are returned by the invocation of plugin functions
            // the `input` is being passed in as the `this` for the invoked function
            // this is so that functions that return objects containing functions can chain
            // e.g. await (await $func())
            result = proc.apply(input, validatedArgs);
            if (!isPromise(result)) {
              _context25.n = 7;
              break;
            }
            _context25.n = 6;
            return result;
          case 6:
            result = _context25.v;
          case 7:
            _context25.n = 9;
            break;
          case 8:
            throw {
              code: "T1006",
              stack: new Error().stack
            };
          case 9:
            _context25.n = 11;
            break;
          case 10:
            _context25.p = 10;
            _t18 = _context25.v;
            if (proc) {
              if (typeof _t18.token == 'undefined' && typeof proc.token !== 'undefined') {
                _t18.token = proc.token;
              }
              _t18.position = proc.position || _t18.position;
            }
            throw _t18;
          case 11:
            return _context25.a(2, result);
        }
      }, _callee24, null, [[0, 10]]);
    }));
    return _applyInner.apply(this, arguments);
  }
  function evaluateLambda(expr, input, environment) {
    // make a function (closure)
    var procedure = {
      _jsonata_lambda: true,
      input: input,
      environment: environment,
      arguments: expr.arguments,
      signature: expr.signature,
      body: expr.body
    };
    if (expr.thunk === true) {
      procedure.thunk = true;
    }
    procedure.apply = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(self, args) {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return apply(procedure, args, input, !!self ? self.environment : environment);
            case 1:
              return _context2.a(2, _context2.v);
          }
        }, _callee2);
      }));
      return function (_x59, _x60) {
        return _ref2.apply(this, arguments);
      };
    }();
    return procedure;
  }

  /**
   * Evaluate partial application
   * @param {Object} expr - JSONata expression
   * @param {Object} input - Input data to evaluate against
   * @param {Object} environment - Environment
   * @returns {*} Evaluated input data
   */
  function evaluatePartialApplication(_x61, _x62, _x63) {
    return _evaluatePartialApplication.apply(this, arguments);
  }
  /**
   * Validate the arguments against the signature validator (if it exists)
   * @param {Function} signature - validator function
   * @param {Array} args - function arguments
   * @param {*} context - context value
   * @returns {Array} - validated arguments
   */
  function _evaluatePartialApplication() {
    _evaluatePartialApplication = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee25(expr, input, environment) {
      var result, evaluatedArgs, ii, arg, proc, _t19;
      return _regenerator().w(function (_context26) {
        while (1) switch (_context26.n) {
          case 0:
            // partially apply a function
            // evaluate the arguments
            evaluatedArgs = [];
            ii = 0;
          case 1:
            if (!(ii < expr.arguments.length)) {
              _context26.n = 5;
              break;
            }
            arg = expr.arguments[ii];
            if (!(arg.type === 'operator' && arg.value === '?')) {
              _context26.n = 2;
              break;
            }
            evaluatedArgs.push(arg);
            _context26.n = 4;
            break;
          case 2:
            _t19 = evaluatedArgs;
            _context26.n = 3;
            return _evaluate2(arg, input, environment);
          case 3:
            _t19.push.call(_t19, _context26.v);
          case 4:
            ii++;
            _context26.n = 1;
            break;
          case 5:
            _context26.n = 6;
            return _evaluate2(expr.procedure, input, environment);
          case 6:
            proc = _context26.v;
            if (!(typeof proc === 'undefined' && expr.procedure.type === 'path' && environment.lookup(expr.procedure.steps[0].value))) {
              _context26.n = 7;
              break;
            }
            throw {
              code: "T1007",
              stack: new Error().stack,
              position: expr.position,
              token: expr.procedure.steps[0].value
            };
          case 7:
            if (!isLambda(proc)) {
              _context26.n = 8;
              break;
            }
            result = partialApplyProcedure(proc, evaluatedArgs, environment);
            _context26.n = 11;
            break;
          case 8:
            if (!(proc && proc._jsonata_function === true)) {
              _context26.n = 9;
              break;
            }
            result = partialApplyNativeFunction(proc.implementation, evaluatedArgs, environment);
            _context26.n = 11;
            break;
          case 9:
            if (!(typeof proc === 'function')) {
              _context26.n = 10;
              break;
            }
            result = partialApplyNativeFunction(proc, evaluatedArgs, environment);
            _context26.n = 11;
            break;
          case 10:
            throw {
              code: "T1008",
              stack: new Error().stack,
              position: expr.position,
              token: expr.procedure.type === 'path' ? expr.procedure.steps[0].value : expr.procedure.value
            };
          case 11:
            return _context26.a(2, result);
        }
      }, _callee25);
    }));
    return _evaluatePartialApplication.apply(this, arguments);
  }
  function validateArguments(signature, args, context) {
    if (typeof signature === 'undefined') {
      // nothing to validate
      return args;
    }
    var validatedArgs = signature.validate(args, context);
    return validatedArgs;
  }

  /**
   * Apply procedure
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @returns {*} Result of procedure
   */
  function applyProcedure(_x64, _x65) {
    return _applyProcedure.apply(this, arguments);
  }
  /**
   * Partially apply procedure
   * @param {Object} proc - Procedure
   * @param {Array} args - Arguments
   * @returns {{lambda: boolean, input: *, environment: {bind, lookup}, arguments: Array, body: *}} Result of partially applied procedure
   */
  function _applyProcedure() {
    _applyProcedure = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee26(proc, args) {
      var result, env;
      return _regenerator().w(function (_context27) {
        while (1) switch (_context27.n) {
          case 0:
            env = createFrame(proc.environment);
            Array.prototype.forEach.call(proc.arguments, function (param, index) {
              env.bind(param.value, args[index]);
            });
            if (!(typeof proc.body === 'function')) {
              _context27.n = 2;
              break;
            }
            _context27.n = 1;
            return applyNativeFunction(proc.body, env);
          case 1:
            result = _context27.v;
            _context27.n = 4;
            break;
          case 2:
            _context27.n = 3;
            return _evaluate2(proc.body, proc.input, env);
          case 3:
            result = _context27.v;
          case 4:
            return _context27.a(2, result);
        }
      }, _callee26);
    }));
    return _applyProcedure.apply(this, arguments);
  }
  function partialApplyProcedure(proc, args, environment) {
    // create a closure, bind the supplied parameters and return a function that takes the remaining (?) parameters
    var env = createFrame(proc.environment || environment);
    var unboundArgs = [];
    Array.prototype.forEach.call(proc.arguments, function (param, index) {
      var arg = args[index];
      if (arg && arg.type === 'operator' && arg.value === '?') {
        unboundArgs.push(param);
      } else {
        env.bind(param.value, arg);
      }
    });
    var procedure = {
      _jsonata_lambda: true,
      input: proc.input,
      environment: env,
      arguments: unboundArgs,
      body: proc.body
    };
    return procedure;
  }

  /**
   * Partially apply native function
   * @param {Function} native - Native function
   * @param {Array} args - Arguments
   * @returns {{lambda: boolean, input: *, environment: {bind, lookup}, arguments: Array, body: *}} Result of partially applying native function
   */
  function partialApplyNativeFunction(_native, args, environment) {
    // create a lambda function that wraps and invokes the native function
    // get the list of declared arguments from the native function
    // this has to be picked out from the toString() value
    var sigArgs = getNativeFunctionArguments(_native);
    sigArgs = sigArgs.map(function (sigArg) {
      return '$' + sigArg.trim();
    });
    var body = 'function(' + sigArgs.join(', ') + '){ _ }';
    var bodyAST = parser(body);
    bodyAST.body = _native;
    var partial = partialApplyProcedure(bodyAST, args, environment);
    return partial;
  }

  /**
   * Apply native function
   * @param {Object} proc - Procedure
   * @param {Object} env - Environment
   * @returns {*} Result of applying native function
   */
  function applyNativeFunction(_x66, _x67) {
    return _applyNativeFunction.apply(this, arguments);
  }
  /**
   * Get native function arguments
   * @param {Function} func - Function
   * @returns {*|Array} Native function arguments
   */
  function _applyNativeFunction() {
    _applyNativeFunction = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee27(proc, env) {
      var sigArgs, args, focus, result;
      return _regenerator().w(function (_context28) {
        while (1) switch (_context28.n) {
          case 0:
            sigArgs = getNativeFunctionArguments(proc); // generate the array of arguments for invoking the function - look them up in the environment
            args = sigArgs.map(function (sigArg) {
              return env.lookup(sigArg.trim());
            });
            focus = {
              environment: env,
              createSequence: env.base.createSequence
            };
            result = proc.apply(focus, args);
            if (!isPromise(result)) {
              _context28.n = 2;
              break;
            }
            _context28.n = 1;
            return result;
          case 1:
            result = _context28.v;
          case 2:
            return _context28.a(2, result);
        }
      }, _callee27);
    }));
    return _applyNativeFunction.apply(this, arguments);
  }
  function getNativeFunctionArguments(func) {
    var signature = func.toString();
    var sigParens = /\(([^)]*)\)/.exec(signature)[1]; // the contents of the parens
    var sigArgs = sigParens.split(',');
    return sigArgs;
  }

  /**
   * Creates a function definition
   * @param {Function} func - function implementation in Javascript
   * @param {string} signature - JSONata function signature definition
   * @returns {{implementation: *, signature: *}} function definition
   */
  function defineFunction(func, signature) {
    var definition = {
      _jsonata_function: true,
      implementation: func
    };
    if (typeof signature !== 'undefined') {
      definition.signature = parseSignature(signature);
    }
    return definition;
  }

  /**
   * parses and evaluates the supplied expression
   * @param {string} expr - expression to evaluate
   * @returns {*} - result of evaluating the expression
   */
  function functionEval(_x68, _x69) {
    return _functionEval.apply(this, arguments);
  }
  /**
   * Clones an object
   * @param {Object} arg - object to clone (deep copy)
   * @returns {*} - the cloned object
   */
  function _functionEval() {
    _functionEval = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee28(expr, focus) {
      var input, ast, result, _t20, _t21;
      return _regenerator().w(function (_context29) {
        while (1) switch (_context29.p = _context29.n) {
          case 0:
            if (!(typeof expr === 'undefined')) {
              _context29.n = 1;
              break;
            }
            return _context29.a(2, undefined);
          case 1:
            input = this.input;
            if (typeof focus !== 'undefined') {
              input = focus;
              // if the input is a JSON array, then wrap it in a singleton sequence so it gets treated as a single input
              if (Array.isArray(input) && !isSequence(input)) {
                input = this.createSequence(input);
                input.outerWrapper = true;
              }
            }
            _context29.p = 2;
            ast = parser(expr, false);
            _context29.n = 4;
            break;
          case 3:
            _context29.p = 3;
            _t20 = _context29.v;
            // error parsing the expression passed to $eval
            populateMessage(_t20);
            throw {
              stack: new Error().stack,
              code: "D3120",
              value: _t20.message,
              error: _t20
            };
          case 4:
            _context29.p = 4;
            _context29.n = 5;
            return _evaluate2(ast, input, this.environment);
          case 5:
            result = _context29.v;
            _context29.n = 7;
            break;
          case 6:
            _context29.p = 6;
            _t21 = _context29.v;
            // error evaluating the expression passed to $eval
            populateMessage(_t21);
            throw {
              stack: new Error().stack,
              code: "D3121",
              value: _t21.message,
              error: _t21
            };
          case 7:
            return _context29.a(2, result);
        }
      }, _callee28, this, [[4, 6], [2, 3]]);
    }));
    return _functionEval.apply(this, arguments);
  }
  function functionClone(arg) {
    // undefined inputs always return undefined
    if (typeof arg === 'undefined') {
      return undefined;
    }
    return JSON.parse(fn.string(arg));
  }

  /**
   * Create frame
   * @param {Object} enclosingEnvironment - Enclosing environment
   * @returns {{bind: bind, lookup: lookup}} Created frame
   */
  function createFrame(enclosingEnvironment) {
    var bindings = Object.create(null);
    var newFrame = {
      bind: function bind(name, value) {
        bindings[name] = value;
      },
      lookup: function lookup(name) {
        var value;
        if (Object.prototype.hasOwnProperty.call(bindings, name)) {
          value = bindings[name];
        } else if (enclosingEnvironment) {
          value = enclosingEnvironment.lookup(name);
        }
        return value;
      },
      timestamp: enclosingEnvironment ? enclosingEnvironment.timestamp : null,
      async: enclosingEnvironment ? enclosingEnvironment.async : false,
      isParallelCall: enclosingEnvironment ? enclosingEnvironment.isParallelCall : false,
      global: enclosingEnvironment ? enclosingEnvironment.global : {
        ancestry: [null]
      }
    };
    if (enclosingEnvironment) {
      var framePushCallback = enclosingEnvironment.lookup(Symbol["for"]('jsonata.__createFrame_push'));
      if (framePushCallback) {
        framePushCallback(enclosingEnvironment, newFrame);
      }
      newFrame.base = enclosingEnvironment.base;
    }
    return newFrame;
  }

  // Function registration
  staticFrame.bind('sum', defineFunction(fn.sum, '<a<n>:n>'));
  staticFrame.bind('count', defineFunction(fn.count, '<a:n>'));
  staticFrame.bind('max', defineFunction(fn.max, '<a<n>:n>'));
  staticFrame.bind('min', defineFunction(fn.min, '<a<n>:n>'));
  staticFrame.bind('average', defineFunction(fn.average, '<a<n>:n>'));
  staticFrame.bind('string', defineFunction(fn.string, '<x-b?:s>'));
  staticFrame.bind('substring', defineFunction(fn.substring, '<s-nn?:s>'));
  staticFrame.bind('substringBefore', defineFunction(fn.substringBefore, '<s-s:s>'));
  staticFrame.bind('substringAfter', defineFunction(fn.substringAfter, '<s-s:s>'));
  staticFrame.bind('lowercase', defineFunction(fn.lowercase, '<s-:s>'));
  staticFrame.bind('uppercase', defineFunction(fn.uppercase, '<s-:s>'));
  staticFrame.bind('length', defineFunction(fn.length, '<s-:n>'));
  staticFrame.bind('trim', defineFunction(fn.trim, '<s-:s>'));
  staticFrame.bind('pad', defineFunction(fn.pad, '<s-ns?:s>'));
  staticFrame.bind('match', defineFunction(fn.match, '<s-f<s:o>n?:a<o>>'));
  staticFrame.bind('contains', defineFunction(fn.contains, '<s-(sf):b>')); // TODO <s-(sf<s:o>):b>
  staticFrame.bind('replace', defineFunction(fn.replace, '<s-(sf)(sf)n?:s>')); // TODO <s-(sf<s:o>)(sf<o:s>)n?:s>
  staticFrame.bind('split', defineFunction(fn.split, '<s-(sf)n?:a<s>>')); // TODO <s-(sf<s:o>)n?:a<s>>
  staticFrame.bind('join', defineFunction(fn.join, '<a<s>s?:s>'));
  staticFrame.bind('formatNumber', defineFunction(fn.formatNumber, '<n-so?:s>'));
  staticFrame.bind('formatBase', defineFunction(fn.formatBase, '<n-n?:s>'));
  staticFrame.bind('formatInteger', defineFunction(datetime.formatInteger, '<n-s:s>'));
  staticFrame.bind('parseInteger', defineFunction(datetime.parseInteger, '<s-s:n>'));
  staticFrame.bind('number', defineFunction(fn.number, '<(nsb)-:n>'));
  staticFrame.bind('floor', defineFunction(fn.floor, '<n-:n>'));
  staticFrame.bind('ceil', defineFunction(fn.ceil, '<n-:n>'));
  staticFrame.bind('round', defineFunction(fn.round, '<n-n?:n>'));
  staticFrame.bind('abs', defineFunction(fn.abs, '<n-:n>'));
  staticFrame.bind('sqrt', defineFunction(fn.sqrt, '<n-:n>'));
  staticFrame.bind('power', defineFunction(fn.power, '<n-n:n>'));
  staticFrame.bind('random', defineFunction(fn.random, '<:n>'));
  staticFrame.bind('boolean', defineFunction(fn["boolean"], '<x-:b>'));
  staticFrame.bind('not', defineFunction(fn.not, '<x-:b>'));
  staticFrame.bind('map', defineFunction(fn.map, '<af>'));
  staticFrame.bind('zip', defineFunction(fn.zip, '<a+>'));
  staticFrame.bind('filter', defineFunction(fn.filter, '<af>'));
  staticFrame.bind('single', defineFunction(fn.single, '<af?>'));
  staticFrame.bind('reduce', defineFunction(fn.foldLeft, '<afj?:j>')); // TODO <f<jj:j>a<j>j?:j>
  staticFrame.bind('sift', defineFunction(fn.sift, '<o-f?:o>'));
  staticFrame.bind('keys', defineFunction(fn.keys, '<x-:a<s>>'));
  staticFrame.bind('lookup', defineFunction(fn.lookup, '<x-s:x>'));
  staticFrame.bind('append', defineFunction(fn.append, '<xx:a>'));
  staticFrame.bind('exists', defineFunction(fn.exists, '<x:b>'));
  staticFrame.bind('spread', defineFunction(fn.spread, '<x-:a<o>>'));
  staticFrame.bind('merge', defineFunction(fn.merge, '<a<o>:o>'));
  staticFrame.bind('reverse', defineFunction(fn.reverse, '<a:a>'));
  staticFrame.bind('each', defineFunction(fn.each, '<o-f:a>'));
  staticFrame.bind('error', defineFunction(fn.error, '<s?:x>'));
  staticFrame.bind('assert', defineFunction(fn.assert, '<bs?:x>'));
  staticFrame.bind('type', defineFunction(fn.type, '<x:s>'));
  staticFrame.bind('sort', defineFunction(fn.sort, '<af?:a>'));
  staticFrame.bind('shuffle', defineFunction(fn.shuffle, '<a:a>'));
  staticFrame.bind('distinct', defineFunction(fn.distinct, '<x:x>'));
  staticFrame.bind('base64encode', defineFunction(fn.base64encode, '<s-:s>'));
  staticFrame.bind('base64decode', defineFunction(fn.base64decode, '<s-:s>'));
  staticFrame.bind('encodeUrlComponent', defineFunction(fn.encodeUrlComponent, '<s-:s>'));
  staticFrame.bind('encodeUrl', defineFunction(fn.encodeUrl, '<s-:s>'));
  staticFrame.bind('decodeUrlComponent', defineFunction(fn.decodeUrlComponent, '<s-:s>'));
  staticFrame.bind('decodeUrl', defineFunction(fn.decodeUrl, '<s-:s>'));
  staticFrame.bind('eval', defineFunction(functionEval, '<sx?:x>'));
  staticFrame.bind('toMillis', defineFunction(datetime.toMillis, '<s-s?:n>'));
  staticFrame.bind('fromMillis', defineFunction(datetime.fromMillis, '<n-s?s?:s>'));
  staticFrame.bind('clone', defineFunction(functionClone, '<(oa)-:o>'));

  /**
   * Error codes
   *
   * Sxxxx    - Static errors (compile time)
   * Txxxx    - Type errors
   * Dxxxx    - Dynamic errors (evaluate time)
   *  01xx    - tokenizer
   *  02xx    - parser
   *  03xx    - regex parser
   *  04xx    - function signature parser/evaluator
   *  10xx    - evaluator
   *  20xx    - operators
   *  3xxx    - functions (blocks of 10 for each function)
   */
  var errorCodes = {
    "S0101": "String literal must be terminated by a matching quote",
    "S0102": "Number out of range: {{token}}",
    "S0103": "Unsupported escape sequence: \\{{token}}",
    "S0104": "The escape sequence \\u must be followed by 4 hex digits",
    "S0105": "Quoted property name must be terminated with a backquote (`)",
    "S0106": "Comment has no closing tag",
    "S0201": "Syntax error: {{token}}",
    "S0202": "Expected {{value}}, got {{token}}",
    "S0203": "Expected {{value}} before end of expression",
    "S0204": "Unknown operator: {{token}}",
    "S0205": "Unexpected token: {{token}}",
    "S0206": "Unknown expression type: {{token}}",
    "S0207": "Unexpected end of expression",
    "S0208": "Parameter {{value}} of function definition must be a variable name (start with $)",
    "S0209": "A predicate cannot follow a grouping expression in a step",
    "S0210": "Each step can only have one grouping expression",
    "S0211": "The symbol {{token}} cannot be used as a unary operator",
    "S0212": "The left side of := must be a variable name (start with $)",
    "S0213": "The literal value {{value}} cannot be used as a step within a path expression",
    "S0214": "The right side of {{token}} must be a variable name (start with $)",
    "S0215": "A context variable binding must precede any predicates on a step",
    "S0216": "A context variable binding must precede the 'order-by' clause on a step",
    "S0217": "The object representing the 'parent' cannot be derived from this expression",
    "S0301": "Empty regular expressions are not allowed",
    "S0302": "No terminating / in regular expression",
    "S0402": "Choice groups containing parameterized types are not supported",
    "S0401": "Type parameters can only be applied to functions and arrays",
    "S0500": "Attempted to evaluate an expression containing syntax error(s)",
    "T0410": "Argument {{index}} of function {{token}} does not match function signature",
    "T0411": "Context value is not a compatible type with argument {{index}} of function {{token}}",
    "T0412": "Argument {{index}} of function {{token}} must be an array of {{type}}",
    "D1001": "Number out of range: {{value}}",
    "D1002": "Cannot negate a non-numeric value: {{value}}",
    "T1003": "Key in object structure must evaluate to a string; got: {{value}}",
    "D1004": "Regular expression matches zero length string",
    "T1005": "Attempted to invoke a non-function. Did you mean ${{{token}}}?",
    "T1006": "Attempted to invoke a non-function",
    "T1007": "Attempted to partially apply a non-function. Did you mean ${{{token}}}?",
    "T1008": "Attempted to partially apply a non-function",
    "D1009": "Multiple key definitions evaluate to same key: {{value}}",
    "T1010": "The matcher function argument passed to function {{token}} does not return the correct object structure",
    "D1011": "Stack overflow. Check for non-terminating recursive function.  Consider rewriting as tail-recursive",
    "D1012": "Evaluation timeout after {{value}} milliseconds. Check for infinite loop",
    "D1013": "Object property names starting with _jsonata_ are reserved for internal use: {{value}}",
    "T2001": "The left side of the {{token}} operator must evaluate to a number",
    "T2002": "The right side of the {{token}} operator must evaluate to a number",
    "T2003": "The left side of the range operator (..) must evaluate to an integer",
    "T2004": "The right side of the range operator (..) must evaluate to an integer",
    "D2005": "The left side of := must be a variable name (start with $)",
    // defunct - replaced by S0212 parser error
    "T2006": "The right side of the function application operator ~> must be a function",
    "T2007": "Type mismatch when comparing values {{value}} and {{value2}} in order-by clause",
    "T2008": "The expressions within an order-by clause must evaluate to numeric or string values",
    "T2009": "The values {{value}} and {{value2}} either side of operator {{token}} must be of the same data type",
    "T2010": "The expressions either side of operator {{token}} must evaluate to numeric or string values",
    "T2011": "The insert/update clause of the transform expression must evaluate to an object: {{value}}",
    "T2012": "The delete clause of the transform expression must evaluate to a string or array of strings: {{value}}",
    "T2013": "The transform expression clones the input object using the $clone() function.  This has been overridden in the current scope by a non-function.",
    "D2014": "The size of the sequence allocated by the range operator (..) must not exceed 1e7.  Attempted to allocate {{value}}.",
    "D2015": "The maximum sequence length of {{value}} was exceeded.",
    "D3001": "Attempting to invoke string function on Infinity or NaN",
    "D3010": "Second argument of replace function cannot be an empty string",
    "D3011": "Fourth argument of replace function must evaluate to a positive number",
    "D3012": "Attempted to replace a matched string with a non-string value",
    "D3020": "Third argument of split function must evaluate to a positive number",
    "D3030": "Unable to cast value to a number: {{value}}",
    "D3040": "Third argument of match function must evaluate to a positive number",
    "D3050": "The second argument of reduce function must be a function with at least two arguments",
    "D3060": "The sqrt function cannot be applied to a negative number: {{value}}",
    "D3061": "The power function has resulted in a value that cannot be represented as a JSON number: base={{value}}, exponent={{exp}}",
    "D3070": "The single argument form of the sort function can only be applied to an array of strings or an array of numbers.  Use the second argument to specify a comparison function",
    "D3080": "The picture string must only contain a maximum of two sub-pictures",
    "D3081": "The sub-picture must not contain more than one instance of the 'decimal-separator' character",
    "D3082": "The sub-picture must not contain more than one instance of the 'percent' character",
    "D3083": "The sub-picture must not contain more than one instance of the 'per-mille' character",
    "D3084": "The sub-picture must not contain both a 'percent' and a 'per-mille' character",
    "D3085": "The mantissa part of a sub-picture must contain at least one character that is either an 'optional digit character' or a member of the 'decimal digit family'",
    "D3086": "The sub-picture must not contain a passive character that is preceded by an active character and that is followed by another active character",
    "D3087": "The sub-picture must not contain a 'grouping-separator' character that appears adjacent to a 'decimal-separator' character",
    "D3088": "The sub-picture must not contain a 'grouping-separator' at the end of the integer part",
    "D3089": "The sub-picture must not contain two adjacent instances of the 'grouping-separator' character",
    "D3090": "The integer part of the sub-picture must not contain a member of the 'decimal digit family' that is followed by an instance of the 'optional digit character'",
    "D3091": "The fractional part of the sub-picture must not contain an instance of the 'optional digit character' that is followed by a member of the 'decimal digit family'",
    "D3092": "A sub-picture that contains a 'percent' or 'per-mille' character must not contain a character treated as an 'exponent-separator'",
    "D3093": "The exponent part of the sub-picture must comprise only of one or more characters that are members of the 'decimal digit family'",
    "D3100": "The radix of the formatBase function must be between 2 and 36.  It was given {{value}}",
    "D3110": "The argument of the toMillis function must be an ISO 8601 formatted timestamp. Given {{value}}",
    "D3120": "Syntax error in expression passed to function eval: {{value}}",
    "D3121": "Dynamic error evaluating the expression passed to function eval: {{value}}",
    "D3130": "Formatting or parsing an integer as a sequence starting with {{value}} is not supported by this implementation",
    "D3131": "In a decimal digit pattern, all digits must be from the same decimal group",
    "D3132": "Unknown component specifier {{value}} in date/time picture string",
    "D3133": "The 'name' modifier can only be applied to months and days in the date/time picture string, not {{value}}",
    "D3134": "The timezone integer format specifier cannot have more than four digits",
    "D3135": "No matching closing bracket ']' in date/time picture string",
    "D3136": "The date/time picture string is missing specifiers required to parse the timestamp",
    "D3137": "{{{message}}}",
    "D3138": "The $single() function expected exactly 1 matching result.  Instead it matched more.",
    "D3139": "The $single() function expected exactly 1 matching result.  Instead it matched 0.",
    "D3140": "Malformed URL passed to ${{{functionName}}}(): {{value}}",
    "D3141": "{{{message}}}"
  };

  /**
   * lookup a message template from the catalog and substitute the inserts.
   * Populates `err.message` with the substituted message. Leaves `err.message`
   * untouched if code lookup fails.
   * @param {string} err - error code to lookup
   * @returns {undefined} - `err` is modified in place
   */
  function populateMessage(err) {
    var template = errorCodes[err.code];
    if (typeof template !== 'undefined') {
      // if there are any handlebars, replace them with the field references
      // triple braces - replace with value
      // double braces - replace with json stringified value
      var message = template.replace(/\{\{\{([^}]+)}}}/g, function () {
        return err[arguments[1]];
      });
      message = message.replace(/\{\{([^}]+)}}/g, function () {
        return JSON.stringify(err[arguments[1]]);
      });
      err.message = message;
    }
    // Otherwise retain the original `err.message`
  }

  /**
   * JSONata
   * @param {Object} expr - JSONata expression
   * @param {Object} options
   * @param {boolean} options.recover: attempt to recover on parse error
   * @param {Function} options.RegexEngine: RegEx class constructor to use
   * @param {Integer} options.timeout: evaluation timeout
   * @param {Integer} options.stack: max stack depth
   * @param {Integer} options.sequence: max sequence length
   * @returns {{evaluate: evaluate, assign: assign}} Evaluated expression
   */
  function jsonata(expr, options) {
    var _ast;
    var _errors;
    try {
      _ast = parser(expr, options && options.recover);
      _errors = _ast.errors;
      delete _ast.errors;
    } catch (err) {
      // insert error message into structure
      populateMessage(err); // possible side-effects on `err`
      throw err;
    }
    var environment = createFrame(staticFrame);
    var timestamp = new Date(); // will be overridden on each call to evalute()
    environment.bind('now', defineFunction(function (picture, timezone) {
      return datetime.fromMillis(timestamp.getTime(), picture, timezone);
    }, '<s?s?:s>'));
    environment.bind('millis', defineFunction(function () {
      return timestamp.getTime();
    }, '<:n>'));
    return {
      evaluate: function () {
        var _evaluate3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(input, bindings, callback) {
          var err, exec_env, _i4, _Object$keys4, v, time, it, _t;
          return _regenerator().w(function (_context3) {
            while (1) switch (_context3.p = _context3.n) {
              case 0:
                if (!(typeof _errors !== 'undefined')) {
                  _context3.n = 1;
                  break;
                }
                err = {
                  code: 'S0500',
                  position: 0
                };
                populateMessage(err); // possible side-effects on `err`
                throw err;
              case 1:
                if (typeof bindings !== 'undefined') {
                  // the variable bindings have been passed in - create a frame to hold these
                  exec_env = createFrame(environment);
                  for (_i4 = 0, _Object$keys4 = Object.keys(bindings); _i4 < _Object$keys4.length; _i4++) {
                    v = _Object$keys4[_i4];
                    exec_env.bind(v, bindings[v]);
                  }
                } else {
                  exec_env = environment;
                }
                // put the input document into the environment as the root object
                exec_env.bind('$', input);

                // capture the timestamp and put it in the execution environment
                // the $now() and $millis() functions will return this value - whenever it is called
                timestamp = new Date();
                exec_env.timestamp = timestamp;
                exec_env.options = options;
                exec_env.createSequence = function () {
                  var sequence = [];
                  if (options && options.sequence) {
                    sequence.push = function () {
                      for (var _len = arguments.length, items = new Array(_len), _key = 0; _key < _len; _key++) {
                        items[_key] = arguments[_key];
                      }
                      if (sequence.length + items.length > options.sequence) {
                        throw {
                          code: "D2015",
                          stack: new Error().stack,
                          value: options.sequence
                        };
                      }
                      return Array.prototype.push.apply(sequence, items);
                    };
                  }
                  sequence.sequence = true;
                  if (arguments.length === 1) {
                    sequence.push(arguments[0]);
                  }
                  return sequence;
                };

                // if the input is a JSON array, then wrap it in a singleton sequence so it gets treated as a single input
                if (Array.isArray(input) && !isSequence(input)) {
                  input = exec_env.createSequence(input);
                  input.outerWrapper = true;
                }
                if (options && (options.timeout || options.stack)) {
                  time = Date.now();
                  exec_env.guardrails = function () {
                    if (options.stack > 0 && exec_env.depth > options.stack) {
                      // stack too deep
                      throw {
                        code: 'D1011',
                        value: options.stack,
                        stack: new Error().stack
                      };
                    }
                    if (options.timeout > 0 && Date.now() - time > options.timeout) {
                      // expression has run for too long
                      throw {
                        code: 'D1012',
                        value: options.timeout,
                        stack: new Error().stack
                      };
                    }
                  };
                } else {
                  exec_env.guardrails = function () {};
                }
                exec_env.base = exec_env;
                exec_env.depth = 0;
                if (options && options.RegexEngine) {
                  exec_env.RegexEngine = options.RegexEngine;
                } else {
                  exec_env.RegexEngine = RegExp;
                }
                _context3.p = 2;
                _context3.n = 3;
                return _evaluate2(_ast, input, exec_env);
              case 3:
                it = _context3.v;
                if (typeof callback === "function") {
                  callback(null, it);
                }
                return _context3.a(2, it);
              case 4:
                _context3.p = 4;
                _t = _context3.v;
                // insert error message into structure
                populateMessage(_t); // possible side-effects on `err`
                throw _t;
              case 5:
                return _context3.a(2);
            }
          }, _callee3, null, [[2, 4]]);
        }));
        function evaluate(_x70, _x71, _x72) {
          return _evaluate3.apply(this, arguments);
        }
        return evaluate;
      }(),
      assign: function assign(name, value) {
        environment.bind(name, value);
      },
      registerFunction: function registerFunction(name, implementation, signature) {
        var func = defineFunction(implementation, signature);
        environment.bind(name, func);
      },
      ast: function ast() {
        return _ast;
      },
      errors: function errors() {
        return _errors;
      }
    };
  }
  jsonata.parser = parser; // TODO remove this in a future release - use ast() instead

  return jsonata;
}();
module.exports = jsonata;