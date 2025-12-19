var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// deps/jexl/lib/evaluator/handlers.js
var require_handlers = __commonJS({
  "deps/jexl/lib/evaluator/handlers.js"(exports) {
    var poolNames = {
      functions: "Jexl Function",
      transforms: "Transform"
    };
    exports.ArrayLiteral = function(ast) {
      return this.evalArray(ast.value);
    };
    exports.BinaryExpression = function(ast) {
      const grammarOp = this._grammar.elements[ast.operator];
      if (grammarOp.evalOnDemand) {
        const wrap = (subAst) => ({ eval: () => this.eval(subAst) });
        return grammarOp.evalOnDemand(wrap(ast.left), wrap(ast.right));
      }
      return this.Promise.all([
        this.eval(ast.left),
        this.eval(ast.right)
      ]).then((arr) => grammarOp.eval(arr[0], arr[1]));
    };
    exports.ConditionalExpression = function(ast) {
      return this.eval(ast.test).then((res) => {
        if (res) {
          if (ast.consequent) {
            return this.eval(ast.consequent);
          }
          return res;
        }
        return this.eval(ast.alternate);
      });
    };
    exports.FilterExpression = function(ast) {
      return this.eval(ast.subject).then((subject) => {
        if (ast.relative) {
          return this._filterRelative(subject, ast.expr);
        }
        return this._filterStatic(subject, ast.expr);
      });
    };
    exports.Identifier = function(ast) {
      if (!ast.from) {
        return ast.relative ? this._relContext[ast.value] : this._context[ast.value];
      }
      return this.eval(ast.from).then((context) => {
        if (context === void 0 || context === null) {
          return void 0;
        }
        if (Array.isArray(context)) {
          context = context[0];
        }
        return context[ast.value];
      });
    };
    exports.Literal = function(ast) {
      return ast.value;
    };
    exports.ObjectLiteral = function(ast) {
      return this.evalMap(ast.value);
    };
    exports.FunctionCall = function(ast) {
      const poolName = poolNames[ast.pool];
      if (!poolName) {
        throw new Error(`Corrupt AST: Pool '${ast.pool}' not found`);
      }
      const pool = this._grammar[ast.pool];
      const func = pool[ast.name];
      if (!func) {
        throw new Error(`${poolName} ${ast.name} is not defined.`);
      }
      return this.evalArray(ast.args || []).then((args) => func(...args));
    };
    exports.UnaryExpression = function(ast) {
      return this.eval(ast.right).then(
        (right) => this._grammar.elements[ast.operator].eval(right)
      );
    };
  }
});

// deps/jexl/lib/evaluator/Evaluator.js
var require_Evaluator = __commonJS({
  "deps/jexl/lib/evaluator/Evaluator.js"(exports, module) {
    var handlers = require_handlers();
    var Evaluator = class _Evaluator {
      constructor(grammar, context, relativeContext, promise = Promise) {
        this._grammar = grammar;
        this._context = context || {};
        this._relContext = relativeContext || this._context;
        this.Promise = promise;
      }
      /**
       * Evaluates an expression tree within the configured context.
       * @param {{}} ast An expression tree object
       * @returns {Promise<*>} resolves with the resulting value of the expression.
       */
      eval(ast) {
        return this.Promise.resolve().then(() => {
          return handlers[ast.type].call(this, ast);
        });
      }
      /**
       * Simultaneously evaluates each expression within an array, and delivers the
       * response as an array with the resulting values at the same indexes as their
       * originating expressions.
       * @param {Array<string>} arr An array of expression strings to be evaluated
       * @returns {Promise<Array<{}>>} resolves with the result array
       */
      evalArray(arr) {
        return this.Promise.all(arr.map((elem) => this.eval(elem)));
      }
      /**
       * Simultaneously evaluates each expression within a map, and delivers the
       * response as a map with the same keys, but with the evaluated result for each
       * as their value.
       * @param {{}} map A map of expression names to expression trees to be
       *      evaluated
       * @returns {Promise<{}>} resolves with the result map.
       */
      evalMap(map) {
        const keys = Object.keys(map);
        const result = {};
        const asts = keys.map((key) => {
          return this.eval(map[key]);
        });
        return this.Promise.all(asts).then((vals) => {
          vals.forEach((val, idx) => {
            result[keys[idx]] = val;
          });
          return result;
        });
      }
      /**
       * Applies a filter expression with relative identifier elements to a subject.
       * The intent is for the subject to be an array of subjects that will be
       * individually used as the relative context against the provided expression
       * tree. Only the elements whose expressions result in a truthy value will be
       * included in the resulting array.
       *
       * If the subject is not an array of values, it will be converted to a single-
       * element array before running the filter.
       * @param {*} subject The value to be filtered usually an array. If this value is
       *      not an array, it will be converted to an array with this value as the
       *      only element.
       * @param {{}} expr The expression tree to run against each subject. If the
       *      tree evaluates to a truthy result, then the value will be included in
       *      the returned array otherwise, it will be eliminated.
       * @returns {Promise<Array>} resolves with an array of values that passed the
       *      expression filter.
       * @private
       */
      _filterRelative(subject, expr) {
        const promises = [];
        if (!Array.isArray(subject)) {
          subject = subject === void 0 ? [] : [subject];
        }
        subject.forEach((elem) => {
          const evalInst = new _Evaluator(
            this._grammar,
            this._context,
            elem,
            this.Promise
          );
          promises.push(evalInst.eval(expr));
        });
        return this.Promise.all(promises).then((values) => {
          const results = [];
          values.forEach((value, idx) => {
            if (value) {
              results.push(subject[idx]);
            }
          });
          return results;
        });
      }
      /**
       * Applies a static filter expression to a subject value.  If the filter
       * expression evaluates to boolean true, the subject is returned if false,
       * undefined.
       *
       * For any other resulting value of the expression, this function will attempt
       * to respond with the property at that name or index of the subject.
       * @param {*} subject The value to be filtered.  Usually an Array (for which
       *      the expression would generally resolve to a numeric index) or an
       *      Object (for which the expression would generally resolve to a string
       *      indicating a property name)
       * @param {{}} expr The expression tree to run against the subject
       * @returns {Promise<*>} resolves with the value of the drill-down.
       * @private
       */
      _filterStatic(subject, expr) {
        return this.eval(expr).then((res) => {
          if (typeof res === "boolean") {
            return res ? subject : void 0;
          }
          return subject[res];
        });
      }
    };
    module.exports = Evaluator;
  }
});

// deps/jexl/lib/Lexer.js
var require_Lexer = __commonJS({
  "deps/jexl/lib/Lexer.js"(exports, module) {
    var numericRegex = /^-?(?:(?:[0-9]*\.[0-9]+)|[0-9]+)$/;
    var identRegex = /^[a-zA-Zа-яА-Я_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF$][a-zA-Zа-яА-Я0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF$]*$/;
    var escEscRegex = /\\\\/;
    var whitespaceRegex = /^\s*$/;
    var preOpRegexElems = [
      // Strings
      "'(?:(?:\\\\')|[^'])*'",
      '"(?:(?:\\\\")|[^"])*"',
      // Whitespace
      "\\s+",
      // Booleans
      "\\btrue\\b",
      "\\bfalse\\b"
    ];
    var postOpRegexElems = [
      // Identifiers
      "[a-zA-Z\u0430-\u044F\u0410-\u042F_\xC0-\xD6\xD8-\xF6\xF8-\xFF\\$][a-zA-Z0-9\u0430-\u044F\u0410-\u042F_\xC0-\xD6\xD8-\xF6\xF8-\xFF\\$]*",
      // Numerics (without negative symbol)
      "(?:(?:[0-9]*\\.[0-9]+)|[0-9]+)"
    ];
    var minusNegatesAfter = [
      "binaryOp",
      "unaryOp",
      "openParen",
      "openBracket",
      "question",
      "colon"
    ];
    var Lexer = class {
      constructor(grammar) {
        this._grammar = grammar;
      }
      /**
       * Splits a Jexl expression string into an array of expression elements.
       * @param {string} str A Jexl expression string
       * @returns {Array<string>} An array of substrings defining the functional
       *      elements of the expression.
       */
      getElements(str) {
        const regex = this._getSplitRegex();
        return str.split(regex).filter((elem) => {
          return elem;
        });
      }
      /**
       * Converts an array of expression elements into an array of tokens.  Note that
       * the resulting array may not equal the element array in length, as any
       * elements that consist only of whitespace get appended to the previous
       * token's "raw" property.  For the structure of a token object, please see
       * {@link Lexer#tokenize}.
       * @param {Array<string>} elements An array of Jexl expression elements to be
       *      converted to tokens
       * @returns {Array<{type, value, raw}>} an array of token objects.
       */
      getTokens(elements) {
        const tokens = [];
        let negate = false;
        for (let i = 0; i < elements.length; i++) {
          if (this._isWhitespace(elements[i])) {
            if (tokens.length) {
              tokens[tokens.length - 1].raw += elements[i];
            }
          } else if (elements[i] === "-" && this._isNegative(tokens)) {
            negate = true;
          } else {
            if (negate) {
              elements[i] = "-" + elements[i];
              negate = false;
            }
            tokens.push(this._createToken(elements[i]));
          }
        }
        if (negate) {
          tokens.push(this._createToken("-"));
        }
        return tokens;
      }
      /**
       * Converts a Jexl string into an array of tokens.  Each token is an object
       * in the following format:
       *
       *     {
       *         type: <string>,
       *         [name]: <string>,
       *         value: <boolean|number|string>,
       *         raw: <string>
       *     }
       *
       * Type is one of the following:
       *
       *      literal, identifier, binaryOp, unaryOp
       *
       * OR, if the token is a control character its type is the name of the element
       * defined in the Grammar.
       *
       * Name appears only if the token is a control string found in
       * {@link grammar#elements}, and is set to the name of the element.
       *
       * Value is the value of the token in the correct type (boolean or numeric as
       * appropriate). Raw is the string representation of this value taken directly
       * from the expression string, including any trailing spaces.
       * @param {string} str The Jexl string to be tokenized
       * @returns {Array<{type, value, raw}>} an array of token objects.
       * @throws {Error} if the provided string contains an invalid token.
       */
      tokenize(str) {
        const elements = this.getElements(str);
        return this.getTokens(elements);
      }
      /**
       * Creates a new token object from an element of a Jexl string. See
       * {@link Lexer#tokenize} for a description of the token object.
       * @param {string} element The element from which a token should be made
       * @returns {{value: number|boolean|string, [name]: string, type: string,
       *      raw: string}} a token object describing the provided element.
       * @throws {Error} if the provided string is not a valid expression element.
       * @private
       */
      _createToken(element) {
        const token = {
          type: "literal",
          value: element,
          raw: element
        };
        if (element[0] === '"' || element[0] === "'") {
          token.value = this._unquote(element);
        } else if (element.match(numericRegex)) {
          token.value = parseFloat(element);
        } else if (element === "true" || element === "false") {
          token.value = element === "true";
        } else if (this._grammar.elements[element]) {
          token.type = this._grammar.elements[element].type;
        } else if (element.match(identRegex)) {
          token.type = "identifier";
        } else {
          throw new Error(`Invalid expression token: ${element}`);
        }
        return token;
      }
      /**
       * Escapes a string so that it can be treated as a string literal within a
       * regular expression.
       * @param {string} str The string to be escaped
       * @returns {string} the RegExp-escaped string.
       * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
       * @private
       */
      _escapeRegExp(str) {
        str = str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (str.match(identRegex)) {
          str = "\\b" + str + "\\b";
        }
        return str;
      }
      /**
       * Gets a RegEx object appropriate for splitting a Jexl string into its core
       * elements.
       * @returns {RegExp} An element-splitting RegExp object
       * @private
       */
      _getSplitRegex() {
        if (!this._splitRegex) {
          const elemArray = Object.keys(this._grammar.elements).sort((a, b) => {
            return b.length - a.length;
          }).map((elem) => {
            return this._escapeRegExp(elem);
          }, this);
          this._splitRegex = new RegExp(
            "(" + [
              preOpRegexElems.join("|"),
              elemArray.join("|"),
              postOpRegexElems.join("|")
            ].join("|") + ")"
          );
        }
        return this._splitRegex;
      }
      /**
       * Determines whether the addition of a '-' token should be interpreted as a
       * negative symbol for an upcoming number, given an array of tokens already
       * processed.
       * @param {Array<Object>} tokens An array of tokens already processed
       * @returns {boolean} true if adding a '-' should be considered a negative
       *      symbol; false otherwise
       * @private
       */
      _isNegative(tokens) {
        if (!tokens.length) return true;
        return minusNegatesAfter.some(
          (type) => type === tokens[tokens.length - 1].type
        );
      }
      /**
       * A utility function to determine if a string consists of only space
       * characters.
       * @param {string} str A string to be tested
       * @returns {boolean} true if the string is empty or consists of only spaces;
       *      false otherwise.
       * @private
       */
      _isWhitespace(str) {
        return !!str.match(whitespaceRegex);
      }
      /**
       * Removes the beginning and trailing quotes from a string, unescapes any
       * escaped quotes on its interior, and unescapes any escaped escape
       * characters. Note that this function is not defensive; it assumes that the
       * provided string is not empty, and that its first and last characters are
       * actually quotes.
       * @param {string} str A string whose first and last characters are quotes
       * @returns {string} a string with the surrounding quotes stripped and escapes
       *      properly processed.
       * @private
       */
      _unquote(str) {
        const quote = str[0];
        const escQuoteRegex = new RegExp("\\\\" + quote, "g");
        return str.substr(1, str.length - 2).replace(escQuoteRegex, quote).replace(escEscRegex, "\\");
      }
    };
    module.exports = Lexer;
  }
});

// deps/jexl/lib/parser/handlers.js
var require_handlers2 = __commonJS({
  "deps/jexl/lib/parser/handlers.js"(exports) {
    exports.argVal = function(ast) {
      if (ast) this._cursor.args.push(ast);
    };
    exports.arrayStart = function() {
      this._placeAtCursor({
        type: "ArrayLiteral",
        value: []
      });
    };
    exports.arrayVal = function(ast) {
      if (ast) {
        this._cursor.value.push(ast);
      }
    };
    exports.binaryOp = function(token) {
      const precedence = this._grammar.elements[token.value].precedence || 0;
      let parent = this._cursor._parent;
      while (parent && parent.operator && this._grammar.elements[parent.operator].precedence >= precedence) {
        this._cursor = parent;
        parent = parent._parent;
      }
      const node = {
        type: "BinaryExpression",
        operator: token.value,
        left: this._cursor
      };
      this._setParent(this._cursor, node);
      this._cursor = parent;
      this._placeAtCursor(node);
    };
    exports.dot = function() {
      this._nextIdentEncapsulate = this._cursor && this._cursor.type !== "UnaryExpression" && (this._cursor.type !== "BinaryExpression" || this._cursor.type === "BinaryExpression" && this._cursor.right);
      this._nextIdentRelative = !this._cursor || this._cursor && !this._nextIdentEncapsulate;
      if (this._nextIdentRelative) {
        this._relative = true;
      }
    };
    exports.filter = function(ast) {
      this._placeBeforeCursor({
        type: "FilterExpression",
        expr: ast,
        relative: this._subParser.isRelative(),
        subject: this._cursor
      });
    };
    exports.functionCall = function() {
      this._placeBeforeCursor({
        type: "FunctionCall",
        name: this._cursor.value,
        args: [],
        pool: "functions"
      });
    };
    exports.identifier = function(token) {
      const node = {
        type: "Identifier",
        value: token.value
      };
      if (this._nextIdentEncapsulate) {
        node.from = this._cursor;
        this._placeBeforeCursor(node);
        this._nextIdentEncapsulate = false;
      } else {
        if (this._nextIdentRelative) {
          node.relative = true;
          this._nextIdentRelative = false;
        }
        this._placeAtCursor(node);
      }
    };
    exports.literal = function(token) {
      this._placeAtCursor({
        type: "Literal",
        value: token.value
      });
    };
    exports.objKey = function(token) {
      this._curObjKey = token.value;
    };
    exports.objStart = function() {
      this._placeAtCursor({
        type: "ObjectLiteral",
        value: {}
      });
    };
    exports.objVal = function(ast) {
      this._cursor.value[this._curObjKey] = ast;
    };
    exports.subExpression = function(ast) {
      this._placeAtCursor(ast);
    };
    exports.ternaryEnd = function(ast) {
      this._cursor.alternate = ast;
    };
    exports.ternaryMid = function(ast) {
      this._cursor.consequent = ast;
    };
    exports.ternaryStart = function() {
      this._tree = {
        type: "ConditionalExpression",
        test: this._tree
      };
      this._cursor = this._tree;
    };
    exports.transform = function(token) {
      this._placeBeforeCursor({
        type: "FunctionCall",
        name: token.value,
        args: [this._cursor],
        pool: "transforms"
      });
    };
    exports.unaryOp = function(token) {
      this._placeAtCursor({
        type: "UnaryExpression",
        operator: token.value
      });
    };
  }
});

// deps/jexl/lib/parser/states.js
var require_states = __commonJS({
  "deps/jexl/lib/parser/states.js"(exports) {
    var h = require_handlers2();
    exports.states = {
      expectOperand: {
        tokenTypes: {
          literal: { toState: "expectBinOp" },
          identifier: { toState: "identifier" },
          unaryOp: {},
          openParen: { toState: "subExpression" },
          openCurl: { toState: "expectObjKey", handler: h.objStart },
          dot: { toState: "traverse" },
          openBracket: { toState: "arrayVal", handler: h.arrayStart }
        }
      },
      expectBinOp: {
        tokenTypes: {
          binaryOp: { toState: "expectOperand" },
          pipe: { toState: "expectTransform" },
          dot: { toState: "traverse" },
          question: { toState: "ternaryMid", handler: h.ternaryStart }
        },
        completable: true
      },
      expectTransform: {
        tokenTypes: {
          identifier: { toState: "postTransform", handler: h.transform }
        }
      },
      expectObjKey: {
        tokenTypes: {
          identifier: { toState: "expectKeyValSep", handler: h.objKey },
          closeCurl: { toState: "expectBinOp" }
        }
      },
      expectKeyValSep: {
        tokenTypes: {
          colon: { toState: "objVal" }
        }
      },
      postTransform: {
        tokenTypes: {
          openParen: { toState: "argVal" },
          binaryOp: { toState: "expectOperand" },
          dot: { toState: "traverse" },
          openBracket: { toState: "filter" },
          pipe: { toState: "expectTransform" }
        },
        completable: true
      },
      postArgs: {
        tokenTypes: {
          binaryOp: { toState: "expectOperand" },
          dot: { toState: "traverse" },
          openBracket: { toState: "filter" },
          pipe: { toState: "expectTransform" }
        },
        completable: true
      },
      identifier: {
        tokenTypes: {
          binaryOp: { toState: "expectOperand" },
          dot: { toState: "traverse" },
          openBracket: { toState: "filter" },
          openParen: { toState: "argVal", handler: h.functionCall },
          pipe: { toState: "expectTransform" },
          question: { toState: "ternaryMid", handler: h.ternaryStart }
        },
        completable: true
      },
      traverse: {
        tokenTypes: {
          identifier: { toState: "identifier" }
        }
      },
      filter: {
        subHandler: h.filter,
        endStates: {
          closeBracket: "identifier"
        }
      },
      subExpression: {
        subHandler: h.subExpression,
        endStates: {
          closeParen: "expectBinOp"
        }
      },
      argVal: {
        subHandler: h.argVal,
        endStates: {
          comma: "argVal",
          closeParen: "postArgs"
        }
      },
      objVal: {
        subHandler: h.objVal,
        endStates: {
          comma: "expectObjKey",
          closeCurl: "expectBinOp"
        }
      },
      arrayVal: {
        subHandler: h.arrayVal,
        endStates: {
          comma: "arrayVal",
          closeBracket: "expectBinOp"
        }
      },
      ternaryMid: {
        subHandler: h.ternaryMid,
        endStates: {
          colon: "ternaryEnd"
        }
      },
      ternaryEnd: {
        subHandler: h.ternaryEnd,
        completable: true
      }
    };
  }
});

// deps/jexl/lib/parser/Parser.js
var require_Parser = __commonJS({
  "deps/jexl/lib/parser/Parser.js"(exports, module) {
    var handlers = require_handlers2();
    var states = require_states().states;
    var Parser = class _Parser {
      constructor(grammar, prefix, stopMap) {
        this._grammar = grammar;
        this._state = "expectOperand";
        this._tree = null;
        this._exprStr = prefix || "";
        this._relative = false;
        this._stopMap = stopMap || {};
      }
      /**
       * Processes a new token into the AST and manages the transitions of the state
       * machine.
       * @param {{type: <string>}} token A token object, as provided by the
       *      {@link Lexer#tokenize} function.
       * @throws {Error} if a token is added when the Parser has been marked as
       *      complete by {@link #complete}, or if an unexpected token type is added.
       * @returns {boolean|*} the stopState value if this parser encountered a token
       *      in the stopState mapb false if tokens can continue.
       */
      addToken(token) {
        if (this._state === "complete") {
          throw new Error("Cannot add a new token to a completed Parser");
        }
        const state = states[this._state];
        const startExpr = this._exprStr;
        this._exprStr += token.raw;
        if (state.subHandler) {
          if (!this._subParser) {
            this._startSubExpression(startExpr);
          }
          const stopState = this._subParser.addToken(token);
          if (stopState) {
            this._endSubExpression();
            if (this._parentStop) return stopState;
            this._state = stopState;
          }
        } else if (state.tokenTypes[token.type]) {
          const typeOpts = state.tokenTypes[token.type];
          let handleFunc = handlers[token.type];
          if (typeOpts.handler) {
            handleFunc = typeOpts.handler;
          }
          if (handleFunc) {
            handleFunc.call(this, token);
          }
          if (typeOpts.toState) {
            this._state = typeOpts.toState;
          }
        } else if (this._stopMap[token.type]) {
          return this._stopMap[token.type];
        } else {
          throw new Error(
            `Token ${token.raw} (${token.type}) unexpected in expression: ${this._exprStr}`
          );
        }
        return false;
      }
      /**
       * Processes an array of tokens iteratively through the {@link #addToken}
       * function.
       * @param {Array<{type: <string>}>} tokens An array of tokens, as provided by
       *      the {@link Lexer#tokenize} function.
       */
      addTokens(tokens) {
        tokens.forEach(this.addToken, this);
      }
      /**
       * Marks this Parser instance as completed and retrieves the full AST.
       * @returns {{}|null} a full expression tree, ready for evaluation by the
       *      {@link Evaluator#eval} function, or null if no tokens were passed to
       *      the parser before complete was called
       * @throws {Error} if the parser is not in a state where it's legal to end
       *      the expression, indicating that the expression is incomplete
       */
      complete() {
        if (this._cursor && !states[this._state].completable) {
          throw new Error(`Unexpected end of expression: ${this._exprStr}`);
        }
        if (this._subParser) {
          this._endSubExpression();
        }
        this._state = "complete";
        return this._cursor ? this._tree : null;
      }
      /**
       * Indicates whether the expression tree contains a relative path identifier.
       * @returns {boolean} true if a relative identifier exists false otherwise.
       */
      isRelative() {
        return this._relative;
      }
      /**
       * Ends a subexpression by completing the subParser and passing its result
       * to the subHandler configured in the current state.
       * @private
       */
      _endSubExpression() {
        states[this._state].subHandler.call(this, this._subParser.complete());
        this._subParser = null;
      }
      /**
       * Places a new tree node at the current position of the cursor (to the 'right'
       * property) and then advances the cursor to the new node. This function also
       * handles setting the parent of the new node.
       * @param {{type: <string>}} node A node to be added to the AST
       * @private
       */
      _placeAtCursor(node) {
        if (!this._cursor) {
          this._tree = node;
        } else {
          this._cursor.right = node;
          this._setParent(node, this._cursor);
        }
        this._cursor = node;
      }
      /**
       * Places a tree node before the current position of the cursor, replacing
       * the node that the cursor currently points to. This should only be called in
       * cases where the cursor is known to exist, and the provided node already
       * contains a pointer to what's at the cursor currently.
       * @param {{type: <string>}} node A node to be added to the AST
       * @private
       */
      _placeBeforeCursor(node) {
        this._cursor = this._cursor._parent;
        this._placeAtCursor(node);
      }
      /**
       * Sets the parent of a node by creating a non-enumerable _parent property
       * that points to the supplied parent argument.
       * @param {{type: <string>}} node A node of the AST on which to set a new
       *      parent
       * @param {{type: <string>}} parent An existing node of the AST to serve as the
       *      parent of the new node
       * @private
       */
      _setParent(node, parent) {
        Object.defineProperty(node, "_parent", {
          value: parent,
          writable: true
        });
      }
      /**
       * Prepares the Parser to accept a subexpression by (re)instantiating the
       * subParser.
       * @param {string} [exprStr] The expression string to prefix to the new Parser
       * @private
       */
      _startSubExpression(exprStr) {
        let endStates = states[this._state].endStates;
        if (!endStates) {
          this._parentStop = true;
          endStates = this._stopMap;
        }
        this._subParser = new _Parser(this._grammar, exprStr, endStates);
      }
    };
    module.exports = Parser;
  }
});

// deps/jexl/lib/PromiseSync.js
var require_PromiseSync = __commonJS({
  "deps/jexl/lib/PromiseSync.js"(exports, module) {
    var PromiseSync = class _PromiseSync {
      constructor(fn) {
        fn(this._resolve.bind(this), this._reject.bind(this));
      }
      catch(rejected) {
        if (this.error) {
          try {
            this._resolve(rejected(this.error));
          } catch (e) {
            this._reject(e);
          }
        }
        return this;
      }
      then(resolved, rejected) {
        if (!this.error) {
          try {
            this._resolve(resolved(this.value));
          } catch (e) {
            this._reject(e);
          }
        }
        if (rejected) this.catch(rejected);
        return this;
      }
      _reject(error) {
        this.value = void 0;
        this.error = error;
      }
      _resolve(val) {
        if (val instanceof _PromiseSync) {
          if (val.error) {
            this._reject(val.error);
          } else {
            this._resolve(val.value);
          }
        } else {
          this.value = val;
          this.error = void 0;
        }
      }
    };
    PromiseSync.all = (vals) => new PromiseSync((resolve) => {
      const resolved = vals.map((val) => {
        while (val instanceof PromiseSync) {
          if (val.error) throw Error(val.error);
          val = val.value;
        }
        return val;
      });
      resolve(resolved);
    });
    PromiseSync.resolve = (val) => new PromiseSync((resolve) => resolve(val));
    PromiseSync.reject = (error) => new PromiseSync((resolve, reject) => reject(error));
    module.exports = PromiseSync;
  }
});

// deps/jexl/lib/Expression.js
var require_Expression = __commonJS({
  "deps/jexl/lib/Expression.js"(exports, module) {
    var Evaluator = require_Evaluator();
    var Lexer = require_Lexer();
    var Parser = require_Parser();
    var PromiseSync = require_PromiseSync();
    var Expression = class {
      constructor(grammar, exprStr) {
        this._grammar = grammar;
        this._exprStr = exprStr;
        this._ast = null;
      }
      /**
       * Forces a compilation of the expression string that this Expression object
       * was constructed with. This function can be called multiple times; useful
       * if the language elements of the associated Jexl instance change.
       * @returns {Expression} this Expression instance, for convenience
       */
      compile() {
        const lexer = new Lexer(this._grammar);
        const parser = new Parser(this._grammar);
        const tokens = lexer.tokenize(this._exprStr);
        parser.addTokens(tokens);
        this._ast = parser.complete();
        return this;
      }
      /**
       * Asynchronously evaluates the expression within an optional context.
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {Promise<*>} resolves with the result of the evaluation.
       */
      eval(context = {}) {
        return this._eval(context, Promise);
      }
      /**
       * Synchronously evaluates the expression within an optional context.
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {*} the result of the evaluation.
       * @throws {*} on error
       */
      evalSync(context = {}) {
        const res = this._eval(context, PromiseSync);
        if (res.error) throw res.error;
        return res.value;
      }
      _eval(context, promise) {
        return promise.resolve().then(() => {
          const ast = this._getAst();
          const evaluator = new Evaluator(
            this._grammar,
            context,
            void 0,
            promise
          );
          return evaluator.eval(ast);
        });
      }
      _getAst() {
        if (!this._ast) this.compile();
        return this._ast;
      }
    };
    module.exports = Expression;
  }
});

// deps/jexl/lib/grammar.js
var require_grammar = __commonJS({
  "deps/jexl/lib/grammar.js"(exports) {
    exports.getGrammar = () => ({
      /**
       * A map of all expression elements to their properties. Note that changes
       * here may require changes in the Lexer or Parser.
       * @type {{}}
       */
      elements: {
        ".": { type: "dot" },
        "[": { type: "openBracket" },
        "]": { type: "closeBracket" },
        "|": { type: "pipe" },
        "{": { type: "openCurl" },
        "}": { type: "closeCurl" },
        ":": { type: "colon" },
        ",": { type: "comma" },
        "(": { type: "openParen" },
        ")": { type: "closeParen" },
        "?": { type: "question" },
        "+": {
          type: "binaryOp",
          precedence: 30,
          eval: (left, right) => left + right
        },
        "-": {
          type: "binaryOp",
          precedence: 30,
          eval: (left, right) => left - right
        },
        "*": {
          type: "binaryOp",
          precedence: 40,
          eval: (left, right) => left * right
        },
        "/": {
          type: "binaryOp",
          precedence: 40,
          eval: (left, right) => left / right
        },
        "//": {
          type: "binaryOp",
          precedence: 40,
          eval: (left, right) => Math.floor(left / right)
        },
        "%": {
          type: "binaryOp",
          precedence: 50,
          eval: (left, right) => left % right
        },
        "^": {
          type: "binaryOp",
          precedence: 50,
          eval: (left, right) => Math.pow(left, right)
        },
        "==": {
          type: "binaryOp",
          precedence: 20,
          eval: (left, right) => left == right
        },
        "!=": {
          type: "binaryOp",
          precedence: 20,
          eval: (left, right) => left != right
        },
        ">": {
          type: "binaryOp",
          precedence: 20,
          eval: (left, right) => left > right
        },
        ">=": {
          type: "binaryOp",
          precedence: 20,
          eval: (left, right) => left >= right
        },
        "<": {
          type: "binaryOp",
          precedence: 20,
          eval: (left, right) => left < right
        },
        "<=": {
          type: "binaryOp",
          precedence: 20,
          eval: (left, right) => left <= right
        },
        "&&": {
          type: "binaryOp",
          precedence: 10,
          evalOnDemand: (left, right) => {
            return left.eval().then((leftVal) => {
              if (!leftVal) return leftVal;
              return right.eval();
            });
          }
        },
        "||": {
          type: "binaryOp",
          precedence: 10,
          evalOnDemand: (left, right) => {
            return left.eval().then((leftVal) => {
              if (leftVal) return leftVal;
              return right.eval();
            });
          }
        },
        in: {
          type: "binaryOp",
          precedence: 20,
          eval: (left, right) => {
            if (typeof right === "string") {
              return right.indexOf(left) !== -1;
            }
            if (Array.isArray(right)) {
              return right.some((elem) => elem === left);
            }
            return false;
          }
        },
        "!": {
          type: "unaryOp",
          precedence: Infinity,
          eval: (right) => !right
        }
      },
      /**
       * A map of function names to javascript functions. A Jexl function
       * takes zero ore more arguemnts:
       *
       *     - {*} ...args: A variable number of arguments passed to this function.
       *       All of these are pre-evaluated to their actual values before calling
       *       the function.
       *
       * The Jexl function should return either the transformed value, or
       * a Promises/A+ Promise object that resolves with the value and rejects
       * or throws only when an unrecoverable error occurs. Functions should
       * generally return undefined when they don't make sense to be used on the
       * given value type, rather than throw/reject. An error is only
       * appropriate when the function would normally return a value, but
       * cannot due to some other failure.
       */
      functions: {},
      /**
       * A map of transform names to transform functions. A transform function
       * takes one ore more arguemnts:
       *
       *     - {*} val: A value to be transformed
       *     - {*} ...args: A variable number of arguments passed to this transform.
       *       All of these are pre-evaluated to their actual values before calling
       *       the function.
       *
       * The transform function should return either the transformed value, or
       * a Promises/A+ Promise object that resolves with the value and rejects
       * or throws only when an unrecoverable error occurs. Transforms should
       * generally return undefined when they don't make sense to be used on the
       * given value type, rather than throw/reject. An error is only
       * appropriate when the transform would normally return a value, but
       * cannot due to some other failure.
       */
      transforms: {}
    });
  }
});

// deps/jexl/lib/Jexl.js
var require_Jexl = __commonJS({
  "deps/jexl/lib/Jexl.js"(exports, module) {
    var Expression = require_Expression();
    var { getGrammar } = require_grammar();
    var Jexl = class {
      constructor() {
        this.expr = this.expr.bind(this);
        this._grammar = getGrammar();
      }
      /**
       * Adds a binary operator to Jexl at the specified precedence. The higher the
       * precedence, the earlier the operator is applied in the order of operations.
       * For example, * has a higher precedence than +, because multiplication comes
       * before division.
       *
       * Please see grammar.js for a listing of all default operators and their
       * precedence values in order to choose the appropriate precedence for the
       * new operator.
       * @param {string} operator The operator string to be added
       * @param {number} precedence The operator's precedence
       * @param {function} fn A function to run to calculate the result. The function
       *      will be called with two arguments: left and right, denoting the values
       *      on either side of the operator. It should return either the resulting
       *      value, or a Promise that resolves with the resulting value.
       * @param {boolean} [manualEval] If true, the `left` and `right` arguments
       *      will be wrapped in objects with an `eval` function. Calling
       *      left.eval() or right.eval() will return a promise that resolves to
       *      that operand's actual value. This is useful to conditionally evaluate
       *      operands.
       */
      addBinaryOp(operator, precedence, fn, manualEval) {
        this._addGrammarElement(operator, {
          type: "binaryOp",
          precedence,
          [manualEval ? "evalOnDemand" : "eval"]: fn
        });
      }
      /**
       * Adds or replaces an expression function in this Jexl instance.
       * @param {string} name The name of the expression function, as it will be
       *      used within Jexl expressions
       * @param {function} fn The javascript function to be executed when this
       *      expression function is invoked. It will be provided with each argument
       *      supplied in the expression, in the same order.
       */
      addFunction(name, fn) {
        this._grammar.functions[name] = fn;
      }
      /**
       * Syntactic sugar for calling {@link #addFunction} repeatedly. This function
       * accepts a map of one or more expression function names to their javascript
       * function counterpart.
       * @param {{}} map A map of expression function names to javascript functions
       */
      addFunctions(map) {
        for (let key in map) {
          this._grammar.functions[key] = map[key];
        }
      }
      /**
       * Adds a unary operator to Jexl. Unary operators are currently only supported
       * on the left side of the value on which it will operate.
       * @param {string} operator The operator string to be added
       * @param {function} fn A function to run to calculate the result. The function
       *      will be called with one argument: the literal value to the right of the
       *      operator. It should return either the resulting value, or a Promise
       *      that resolves with the resulting value.
       */
      addUnaryOp(operator, fn) {
        this._addGrammarElement(operator, {
          type: "unaryOp",
          weight: Infinity,
          eval: fn
        });
      }
      /**
       * Adds or replaces a transform function in this Jexl instance.
       * @param {string} name The name of the transform function, as it will be used
       *      within Jexl expressions
       * @param {function} fn The function to be executed when this transform is
       *      invoked. It will be provided with at least one argument:
       *          - {*} value: The value to be transformed
       *          - {...*} args: The arguments for this transform
       */
      addTransform(name, fn) {
        this._grammar.transforms[name] = fn;
      }
      /**
       * Syntactic sugar for calling {@link #addTransform} repeatedly.  This function
       * accepts a map of one or more transform names to their transform function.
       * @param {{}} map A map of transform names to transform functions
       */
      addTransforms(map) {
        for (let key in map) {
          this._grammar.transforms[key] = map[key];
        }
      }
      /**
       * Creates an Expression object from the given Jexl expression string, and
       * immediately compiles it. The returned Expression object can then be
       * evaluated multiple times with new contexts, without generating any
       * additional string processing overhead.
       * @param {string} expression The Jexl expression to be compiled
       * @returns {Expression} The compiled Expression object
       */
      compile(expression) {
        const exprObj = this.createExpression(expression);
        return exprObj.compile();
      }
      /**
       * Constructs an Expression object from a Jexl expression string.
       * @param {string} expression The Jexl expression to be wrapped in an
       *    Expression object
       * @returns {Expression} The Expression object representing the given string
       */
      createExpression(expression) {
        return new Expression(this._grammar, expression);
      }
      /**
       * Retrieves a previously set expression function.
       * @param {string} name The name of the expression function
       * @returns {function} The expression function
       */
      getFunction(name) {
        return this._grammar.functions[name];
      }
      /**
       * Retrieves a previously set transform function.
       * @param {string} name The name of the transform function
       * @returns {function} The transform function
       */
      getTransform(name) {
        return this._grammar.transforms[name];
      }
      /**
       * Asynchronously evaluates a Jexl string within an optional context.
       * @param {string} expression The Jexl expression to be evaluated
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {Promise<*>} resolves with the result of the evaluation.
       */
      eval(expression, context = {}) {
        const exprObj = this.createExpression(expression);
        return exprObj.eval(context);
      }
      /**
       * Synchronously evaluates a Jexl string within an optional context.
       * @param {string} expression The Jexl expression to be evaluated
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {*} the result of the evaluation.
       * @throws {*} on error
       */
      evalSync(expression, context = {}) {
        const exprObj = this.createExpression(expression);
        return exprObj.evalSync(context);
      }
      /**
       * A JavaScript template literal to allow expressions to be defined by the
       * syntax: expr`40 + 2`
       * @param {Array<string>} strs
       * @param  {...any} args
       */
      expr(strs, ...args) {
        const exprStr = strs.reduce((acc, str, idx) => {
          const arg = idx < args.length ? args[idx] : "";
          acc += str + arg;
          return acc;
        }, "");
        return this.createExpression(exprStr);
      }
      /**
       * Removes a binary or unary operator from the Jexl grammar.
       * @param {string} operator The operator string to be removed
       */
      removeOp(operator) {
        if (this._grammar.elements[operator] && (this._grammar.elements[operator].type === "binaryOp" || this._grammar.elements[operator].type === "unaryOp")) {
          delete this._grammar.elements[operator];
        }
      }
      /**
       * Adds an element to the grammar map used by this Jexl instance.
       * @param {string} str The key string to be added
       * @param {{type: <string>}} obj A map of configuration options for this
       *      grammar element
       * @private
       */
      _addGrammarElement(str, obj) {
        this._grammar.elements[str] = obj;
      }
    };
    module.exports = new Jexl();
    module.exports.Jexl = Jexl;
  }
});
export default require_Jexl();
