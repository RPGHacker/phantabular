// src/Lexer.ts
var numericRegex = /^-?(?:(?:[0-9]*\.[0-9]+)|[0-9]+)$/;
var identRegex = /^[a-zA-Zа-яА-Я_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF$][a-zA-Zа-яА-Я0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF$]*$/;
var whitespaceRegex = /^\s*$/;
var preOpRegexElements = [
  // Strings
  "'(?:(?:\\\\')|[^'])*'",
  '"(?:(?:\\\\")|[^"])*"',
  // Whitespace
  "\\s+",
  // Booleans
  "\\btrue\\b",
  "\\bfalse\\b",
  // Null
  "\\bnull\\b",
  // Undefined
  "\\bundefined\\b",
  // Numerics (without negative symbol)
  "(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)"
];
var postOpRegexElements = [
  // Identifiers
  "[a-zA-Z\u0430-\u044F\u0410-\u042F_\xC0-\xD6\xD8-\xF6\xF8-\xFF\\$][a-zA-Z0-9\u0430-\u044F\u0410-\u042F_\xC0-\xD6\xD8-\xF6\xF8-\xFF\\$]*"
];
var unaryOpsAfter = ["binaryOp", "unaryOp", "openParen", "openBracket", "question", "colon", "comma"];
var Lexer = class {
  /** The grammar configuration containing operators and other language elements */
  _grammar;
  /** Cached regex for splitting expressions, built on first use */
  _splitRegex;
  /**
   * Creates a new Lexer instance with the given grammar configuration.
   *
   * @param grammar The grammar containing operators, functions, and other language elements
   */
  constructor(grammar) {
    this._grammar = grammar;
  }
  /**
   * Splits a Jexl expression string into an array of expression elements.
   * @param str A Jexl expression string
   * @returns An array of substrings defining the functional
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
   * @param elements An array of Jexl expression elements to be
   *      converted to tokens
   * @returns An array of token objects.
   */
  getTokens(elements) {
    const tokens = [];
    let negate = false;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element) continue;
      if (this._isWhitespace(element)) {
        if (tokens.length > 0) {
          tokens[tokens.length - 1].raw += element;
        }
      } else if ((element === "+" || element === "-") && this._isUnary(tokens)) {
        const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
        if (lastToken && lastToken.type === "binaryOp" && (lastToken.value === "+" || lastToken.value === "-") && !lastToken.raw.match(/\s$/)) {
          throw new Error(`Unexpected token '${element}' after operator '${lastToken.value}'`);
        }
        let nextElement = "";
        for (let j = i + 1; j < elements.length; j++) {
          if (!this._isWhitespace(elements[j])) {
            nextElement = elements[j];
            break;
          }
        }
        if (element === "-") {
          if (nextElement.match(numericRegex)) {
            negate = true;
          } else {
            const token = this._createToken(element);
            token.type = "unaryOp";
            tokens.push(token);
          }
        } else {
          if (!nextElement.match(numericRegex)) {
            const token = this._createToken(element);
            token.type = "unaryOp";
            tokens.push(token);
          }
        }
      } else {
        if (negate) {
          elements[i] = "-" + element;
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
   * Converts a Jexl expression string into an array of tokens.
   * This is the main entry point for lexical analysis.
   *
   * Each token is an object with the following structure:
   * ```typescript
   * {
   *   type: string,     // Token type (e.g., 'literal', 'identifier', 'binaryOp')
   *   value: any,       // Processed value (parsed number, unquoted string, etc.)
   *   raw: string       // Original text including any whitespace
   * }
   * ```
   *
   * ## Token Types
   *
   * - **literal**: String, number, or boolean values
   * - **identifier**: Variable names, function names, property names
   * - **binaryOp**: Binary operators like `+`, `-`, `==`, `&&`
   * - **unaryOp**: Unary operators like `!`, `-` (negation)
   * - **Grammar elements**: Control characters defined in grammar (dot, pipe, etc.)
   *
   * ## Value Processing
   *
   * - **Strings**: Quotes are removed and escape sequences processed
   * - **Numbers**: Converted to numeric values using `parseFloat()`
   * - **Booleans**: `"true"` and `"false"` become boolean values
   * - **Others**: Remain as original strings
   *
   * @param str The Jexl expression string to be tokenized
   * @returns An array of token objects representing the expression
   * @throws {Error} if the string contains invalid tokens
   *
   * @example
   * ```typescript
   * lexer.tokenize('user.age >= 18')
   * // Returns:
   * // [
   * //   { type: 'identifier', value: 'user', raw: 'user' },
   * //   { type: 'dot', value: '.', raw: '.' },
   * //   { type: 'identifier', value: 'age', raw: 'age' },
   * //   { type: 'binaryOp', value: '>=', raw: ' >= ' },
   * //   { type: 'literal', value: 18, raw: '18' }
   * // ]
   * ```
   */
  tokenize(str) {
    const elements = this.getElements(str);
    return this.getTokens(elements);
  }
  /**
   * Creates a new token object from an element of a Jexl string. See
   * {@link Lexer#tokenize} for a description of the token object.
   * @param element The element from which a token should be made
   * @returns A token object describing the provided element.
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
    } else if (element === "null") {
      token.value = null;
    } else if (element === "undefined") {
      token.value = void 0;
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
   * @param str The string to be escaped
   * @returns the RegExp-escaped string.
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
        "(" + [preOpRegexElements.join("|"), elemArray.join("|"), postOpRegexElements.join("|")].join("|") + ")"
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
   *      symbol or a '+' should be considered a positive symbol; false otherwise
   * @private
   */
  _isUnary(tokens) {
    if (!tokens.length) return true;
    const lastToken = tokens[tokens.length - 1];
    if (!lastToken) return true;
    return unaryOpsAfter.some((type) => type === lastToken.type);
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
    if (!quote) {
      throw new Error("Cannot unquote empty string");
    }
    const stringWithoutQuotes = str.substr(1, str.length - 2);
    var unescapedString = "";
    for (let i = 0; i < stringWithoutQuotes.length; ++i) {
      if (stringWithoutQuotes[i] == "\\" && i + 1 < stringWithoutQuotes.length && (stringWithoutQuotes[i + 1] == "\\" || stringWithoutQuotes[i + 1] == '"')) {
        ++i;
      }
      unescapedString += stringWithoutQuotes[i];
    }
    return unescapedString;
  }
};

// src/parser/states.ts
var states = {
  expectOperand: {
    tokenTypes: {
      literal: { toState: "expectBinOp" },
      identifier: { toState: "identifier" },
      unaryOp: {},
      openParen: { toState: "subExpression" },
      openCurl: { toState: "expectObjKey", handler: "objStart" },
      dot: { toState: "traverse" },
      openBracket: { toState: "arrayVal", handler: "arrayStart" }
    }
  },
  expectBinOp: {
    tokenTypes: {
      binaryOp: { toState: "expectOperand" },
      pipe: { toState: "expectTransform" },
      dot: { toState: "traverse" },
      question: { toState: "ternaryMid", handler: "ternaryStart" }
    },
    completable: true
  },
  expectTransform: {
    tokenTypes: {
      identifier: { toState: "postTransform", handler: "transform" }
    }
  },
  expectObjKey: {
    tokenTypes: {
      literal: { toState: "expectKeyValSep", handler: "objKey" },
      identifier: { toState: "expectKeyValSep", handler: "objKey" },
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
      question: { toState: "ternaryMid", handler: "ternaryStart" },
      pipe: { toState: "expectTransform" }
    },
    completable: true
  },
  identifier: {
    tokenTypes: {
      binaryOp: { toState: "expectOperand" },
      dot: { toState: "traverse" },
      openBracket: { toState: "filter" },
      openParen: { toState: "argVal", handler: "functionCall" },
      pipe: { toState: "expectTransform" },
      question: { toState: "ternaryMid", handler: "ternaryStart" }
    },
    completable: true
  },
  traverse: {
    tokenTypes: {
      identifier: { toState: "identifier" },
      pipe: { toState: "expectTransform" }
    }
  },
  filter: {
    subHandler: "filter",
    endStates: {
      closeBracket: "identifier"
    }
  },
  subExpression: {
    subHandler: "subExpression",
    endStates: {
      closeParen: "expectBinOp"
    }
  },
  argVal: {
    subHandler: "argVal",
    endStates: {
      comma: "argVal",
      closeParen: "postArgs"
    }
  },
  objVal: {
    subHandler: "objVal",
    endStates: {
      comma: "expectObjKey",
      closeCurl: "expectBinOp"
    }
  },
  arrayVal: {
    subHandler: "arrayVal",
    endStates: {
      comma: "arrayVal",
      closeBracket: "expectBinOp"
    }
  },
  ternaryMid: {
    subHandler: "ternaryMid",
    endStates: {
      colon: "ternaryEnd"
    }
  },
  ternaryEnd: {
    subHandler: "ternaryEnd",
    completable: true
  }
};

// src/parser/Parser.ts
var Parser = class _Parser {
  /** The grammar object containing language rules, operators, and functions */
  _grammar;
  /** Current state of the parser state machine (e.g., 'expectOperand', 'expectBinaryOp') */
  _state;
  /** Root node of the AST being constructed */
  _tree;
  /** Current expression string being parsed (used for error messages) */
  _exprStr;
  /** Flag indicating if the expression contains relative identifiers (starting with '.') */
  _relative;
  /** Map of token types to stop states for sub expression parsing */
  _stopMap;
  /** Sub parser instance for handling nested expressions */
  _subParser;
  /** Flag indicating if this parser should stop when encountering a stop token */
  _parentStop;
  /** Current position in the AST where new nodes are added */
  _cursor;
  /** Flag indicating if the next identifier should encapsulate the current cursor */
  _nextIdentEncapsulate;
  /** Flag indicating if the next identifier should be relative */
  _nextIdentRelative;
  /** Currently queued object key waiting for a value */
  _curObjKey;
  /**
   * Creates a new Parser instance for building Abstract Syntax Trees from token streams.
   *
   * @param grammar - Grammar object containing language rules and operators
   * @param prefix - String prefix for error messages (useful for sub expressions)
   * @param stopMap - Map of token types to stop states for sub expression parsing
   *
   * @example Basic parser creation
   * ```typescript
   * const grammar = getGrammar()
   * const parser = new Parser(grammar)
   * ```
   *
   * @example Sub expression parser with stop conditions
   * ```typescript
   * // Parser that stops when encountering ')' or ',' tokens
   * const subParser = new Parser(grammar, "func(", {
   *   ')': 'functionEnd',
   *   ',': 'nextArg'
   * })
   * ```
   *
   * @example Error message prefix
   * ```typescript
   * // For better error messages in nested contexts
   * const parser = new Parser(grammar, "users[.age > ")
   * // Error messages will include the prefix for context
   * ```
   */
  constructor(grammar, prefix, stopMap = {}) {
    this._grammar = grammar;
    this._state = "expectOperand";
    this._tree = null;
    this._exprStr = prefix || "";
    this._relative = false;
    this._stopMap = stopMap;
  }
  /**
   * Processes a single token and advances the parser state machine.
   *
   * This is the core method that drives the parsing process. It examines the current parser state,
   * determines if the token is valid in that state, and either processes it directly or delegates
   * to a sub parser for nested expressions.
   *
   * @param token - Token to process (from lexer or as part of AST construction)
   * @returns false if parsing should continue, or stop state value if a stop condition was met
   *
   * @example Processing simple tokens
   * ```typescript
   * const parser = new Parser(grammar)
   *
   * // Process identifier token
   * const result1 = parser.addToken({ type: 'identifier', value: 'age', raw: 'age' })
   * // Returns false (continue parsing)
   *
   * // Process operator token
   * const result2 = parser.addToken({ type: 'binaryOp', value: '+', raw: '+' })
   * // Returns false (continue parsing)
   *
   * // Process literal token
   * const result3 = parser.addToken({ type: 'literal', value: 5, raw: '5' })
   * // Returns false (continue parsing)
   * ```
   *
   * @example Sub expression with stop conditions
   * ```typescript
   * // Parser configured to stop on ')' token
   * const parser = new Parser(grammar, "", { ')': 'endGroup' })
   * parser.addToken({ type: 'identifier', value: 'x', raw: 'x' })
   * const result = parser.addToken({ type: 'closeParen', raw: ')' })
   * // Returns 'endGroup' (stop state reached)
   * ```
   *
   * @throws {Error} When parser is already complete
   * @throws {Error} When unexpected token type is encountered
   * @throws {Error} When parser state is invalid
   */
  addToken(token) {
    if (this._state === "complete") {
      throw new Error("Cannot add a new token to a completed Parser");
    }
    const state = states[this._state];
    if (!state) {
      throw new Error(`Invalid parser state: ${this._state}`);
    }
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
    } else if (state.tokenTypes && state.tokenTypes[token.type]) {
      const typeOpts = state.tokenTypes[token.type];
      if (!typeOpts) {
        throw new Error(`No type options for token ${token.type}`);
      }
      if (typeOpts.handler) {
        const handlerMethod = this._getTokenHandlerMethod(typeOpts.handler);
        if (handlerMethod) {
          handlerMethod(token);
        }
      } else {
        const handlerMethod = this._getHandlerMethod(token.type);
        if (handlerMethod) {
          handlerMethod(token);
        }
      }
      if (typeOpts.toState) {
        this._state = typeOpts.toState;
      }
    } else if (this._stopMap[token.type]) {
      return this._stopMap[token.type];
    } else {
      throw new Error(`Token ${token.raw} (${token.type}) unexpected in expression: ${this._exprStr}`);
    }
    return false;
  }
  /**
   * Processes an array of tokens sequentially using {@link addToken}.
   *
   * This is a convenience method for processing multiple tokens at once, typically
   * the entire token stream from a lexer.
   *
   * @param tokens - Array of tokens to process sequentially
   *
   * @example Processing token stream from lexer
   * ```typescript
   * const lexer = new Lexer(grammar)
   * const parser = new Parser(grammar)
   *
   * const tokens = lexer.tokenize("user.name + ' - ' + user.email")
   * parser.addTokens(tokens)
   * const ast = parser.complete()
   * // Fully parsed AST ready for evaluation
   * ```
   *
   * @example Manual token array
   * ```typescript
   * const tokens = [
   *   { type: 'identifier', value: 'age', raw: 'age' },
   *   { type: 'binaryOp', value: '>', raw: '>' },
   *   { type: 'literal', value: 18, raw: '18' }
   * ]
   * parser.addTokens(tokens)
   * // Creates AST for "age > 18"
   * ```
   */
  addTokens(tokens) {
    tokens.forEach(this.addToken, this);
  }
  /**
   * Finalizes parsing and returns the completed Abstract Syntax Tree.
   *
   * This method should be called after all tokens have been processed. It verifies that
   * the parser is in a valid end state and returns the root of the constructed AST.
   *
   * @returns The root AST node, or null if no tokens were processed
   *
   * @example Completing simple expression
   * ```typescript
   * const parser = new Parser(grammar)
   * parser.addTokens(lexer.tokenize("price * quantity"))
   * const ast = parser.complete()
   * // Returns:
   * // {
   * //   type: 'BinaryExpression',
   * //   operator: '*',
   * //   left: { type: 'Identifier', value: 'price' },
   * //   right: { type: 'Identifier', value: 'quantity' }
   * // }
   * ```
   *
   * @example Completing complex expression
   * ```typescript
   * parser.addTokens(lexer.tokenize("users[.age > 21 && .active].name"))
   * const ast = parser.complete()
   * // Returns complex AST with FilterExpression containing nested BinaryExpression
   * ```
   *
   * @example Empty expression
   * ```typescript
   * const parser = new Parser(grammar)
   * const ast = parser.complete()
   * // Returns null (no tokens processed)
   * ```
   *
   * @throws {Error} When parser is not in a valid completion state (incomplete expression)
   */
  complete() {
    const currentState = states[this._state];
    if (this._cursor && (!currentState || !currentState.completable)) {
      throw new Error(`Unexpected end of expression: ${this._exprStr}`);
    }
    if (this._subParser) {
      this._endSubExpression();
    }
    this._state = "complete";
    return this._cursor ? this._tree : null;
  }
  /**
   * Indicates whether the expression contains relative path identifiers.
   *
   * Relative identifiers start with '.' and are used in filter expressions to reference
   * properties of the current context item (e.g., '.age' in 'users[.age > 18]').
   *
   * @returns true if relative identifiers are present, false otherwise
   *
   * @example Expression with relative identifiers
   * ```typescript
   * const parser = new Parser(grammar)
   * parser.addTokens(lexer.tokenize("users[.age > 18 && .active]"))
   * parser.complete()
   * const hasRelative = parser.isRelative()
   * // Returns true (contains '.age' and '.active')
   * ```
   *
   * @example Expression without relative identifiers
   * ```typescript
   * parser.addTokens(lexer.tokenize("user.name + user.email"))
   * parser.complete()
   * const hasRelative = parser.isRelative()
   * // Returns false (no relative identifiers)
   * ```
   *
   * @example Used in sub expression parsing
   * ```typescript
   * // When parsing filter expressions, this helps determine the filter type
   * const filterParser = new Parser(grammar, "", stopMap)
   * filterParser.addTokens(filterTokens)
   * const filterAst = filterParser.complete()
   * if (filterParser.isRelative()) {
   *   // Use relative filtering (each array element as context)
   * } else {
   *   // Use static filtering (property access or boolean check)
   * }
   * ```
   */
  isRelative() {
    return this._relative;
  }
  /**
   * Ends a sub expression by completing the subParser and passing its result
   * to the subHandler configured in the current state.
   * @private
   */
  _endSubExpression() {
    const currentState = states[this._state];
    if (!currentState || !currentState.subHandler) {
      throw new Error(`Invalid state for ending sub expression: ${this._state}`);
    }
    const subHandlerName = currentState.subHandler;
    const handlerMethod = this._getSubHandlerMethod(subHandlerName);
    if (handlerMethod) {
      handlerMethod(this._subParser.complete());
    }
    this._subParser = null;
  }
  /**
   * Places a new AST node at the current cursor position and advances the cursor.
   *
   * This is the primary method for adding nodes to the AST. It handles both root node
   * creation and linking nodes into the tree structure.
   *
   * @param node - AST node to place at the cursor
   *
   * @example First node (root)
   * ```typescript
   * // When tree is empty, node becomes the root
   * this._placeAtCursor({ type: 'Identifier', value: 'user' })
   * // Result: _tree = { type: 'Identifier', value: 'user' }
   * //         _cursor points to this node
   * ```
   *
   * @example Subsequent nodes
   * ```typescript
   * // When cursor exists, node becomes the 'right' child
   * this._placeAtCursor({ type: 'Literal', value: 5 })
   * // Result: previous node's 'right' property points to new node
   * //         _cursor advances to new node
   * ```
   *
   * @example Building binary expression
   * ```typescript
   * // For "a + b":
   * // 1. Place identifier 'a' (becomes root)
   * // 2. Binary operator '+' restructures tree
   * // 3. Place identifier 'b' (becomes right child of '+')
   * ```
   *
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
   * Places a node before the current cursor position, effectively replacing the cursor node.
   *
   * This method is used when a node needs to "wrap" or "contain" the current cursor node,
   * such as when creating filter expressions or function calls.
   *
   * @param node - AST node that should contain the current cursor node
   *
   * @example Creating filter expression
   * ```typescript
   * // Current cursor points to 'users' identifier
   * // Create filter that wraps it:
   * this._placeBeforeCursor({
   *   type: 'FilterExpression',
   *   subject: this._cursor,  // 'users' becomes the subject
   *   expr: filterAst,
   *   relative: true
   * })
   * // Result: FilterExpression becomes new cursor, containing 'users'
   * ```
   *
   * @example Converting identifier to function call
   * ```typescript
   * // Current cursor points to 'max' identifier
   * // Convert to function call:
   * this._placeBeforeCursor({
   *   type: 'FunctionCall',
   *   name: this._cursor.value,  // 'max'
   *   args: [],
   *   pool: 'functions'
   * })
   * // Result: FunctionCall replaces identifier, ready for arguments
   * ```
   *
   * @private
   */
  _placeBeforeCursor(node) {
    this._cursor = this._cursor?._parent;
    this._placeAtCursor(node);
  }
  /**
   * Sets the parent of a node by creating a non-enumerable _parent property
   * that points to the supplied parent argument.
   * @param node A node of the AST on which to set a new
   *      parent
   * @param parent An existing node of the AST to serve as the
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
   * Prepares the Parser to accept a sub expression by (re)instantiating the
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
  /**
   * Handles a sub expression that's used to define a transform argument's value.
   * @param ast The sub expression tree
   */
  argVal(ast) {
    if (ast) {
      this._cursor?.args?.push(ast);
    }
  }
  /**
   * Handles new array literals by adding them as a new node in the AST,
   * initialized with an empty array.
   */
  arrayStart() {
    this._placeAtCursor({
      type: "ArrayLiteral",
      value: []
    });
  }
  /**
   * Handles a sub expression representing an element of an array literal.
   * @param ast The sub expression tree
   */
  arrayVal(ast) {
    const { _cursor } = this;
    if (ast && _cursor && Array.isArray(_cursor.value)) {
      _cursor.value.push(ast);
    }
  }
  /**
   * Handles binary operator tokens and manages operator precedence.
   *
   * Binary operators like +, -, *, /, ==, etc. require special handling to ensure correct
   * operator precedence. This method restructures the AST to maintain proper order of operations.
   *
   * @param token - Binary operator token with operator value
   *
   * @example Operator precedence handling
   * ```typescript
   * // For expression "2 + 3 * 4"
   * // First processes: 2, then +, then 3, then *
   * // When * is encountered, it has higher precedence than +
   * // So the tree gets restructured to ensure 3*4 is evaluated first
   * //
   * // Before * token:           After * token:
   * //     +                        +
   * //   /   \                    /   \
   * //  2     3                  2     *
   * //                                / \
   * //                               3   (next)
   * ```
   *
   * @example Left-to-right evaluation for same precedence
   * ```typescript
   * // For expression "10 - 5 + 2"
   * // Both - and + have same precedence, so left-to-right evaluation
   * // Final AST: ((10 - 5) + 2)
   * ```
   */
  binaryOp(token) {
    const precedence = this._grammar.elements[token.value]?.precedence || 0;
    let parent = this._cursor?._parent;
    while (parent && parent.operator && this._grammar.elements[parent.operator]?.precedence >= precedence) {
      this._cursor = parent;
      parent = parent._parent;
    }
    const node = {
      type: "BinaryExpression",
      operator: token.value,
      left: this._cursor
    };
    if (this._cursor) {
      this._setParent(this._cursor, node);
    }
    this._cursor = parent;
    this._placeAtCursor(node);
  }
  /**
   * Handles dot (.) tokens for property access and relative identifier setup.
   *
   * The dot operator is used for property access (user.name) and to indicate relative
   * identifiers in filters (.age). This method sets up state flags that control how
   * the next identifier will be processed.
   *
   * @example Property access chain
   * ```typescript
   * // For "user.profile.avatar"
   * // Each dot sets up the next identifier to be chained from the previous
   * // Creates: { type: 'Identifier', value: 'avatar', from: { ... } }
   * ```
   *
   * @example Relative identifier in filter
   * ```typescript
   * // For "users[.age > 18]"
   * // The dot before 'age' marks it as relative to the current filter context
   * // Creates: { type: 'Identifier', value: 'age', relative: true }
   * ```
   *
   * @example Standalone relative identifier for transforms
   * ```typescript
   * // For ".|transform" - the dot is standalone and becomes a relative identifier
   * // Creates: { type: 'Identifier', value: '.', relative: true }
   * ```
   *
   * @example Mixed access patterns
   * ```typescript
   * // For "data.items[.value > threshold].name"
   * // First dot: normal property access (data.items)
   * // Second dot: relative identifier (.value)
   * // Third dot: property access on filtered result (.name)
   * ```
   */
  dot() {
    this._nextIdentEncapsulate = Boolean(
      this._cursor && this._cursor.type !== "UnaryExpression" && (this._cursor.type !== "BinaryExpression" || this._cursor.type === "BinaryExpression" && this._cursor.right)
    );
    this._nextIdentRelative = !this._cursor || this._cursor && !this._nextIdentEncapsulate;
    if (this._nextIdentRelative) {
      this._relative = true;
    }
  }
  /**
   * Handles completed filter sub expressions for array filtering or property access.
   *
   * Filter expressions use square bracket notation like [expression]. They can be either
   * relative (filtering arrays where each element becomes context) or static (property access).
   *
   * @param ast - The completed sub expression AST for the filter
   *
   * @example Relative filter (array filtering)
   * ```typescript
   * // For "users[.age > 18]"
   * // Creates FilterExpression with:
   * // - subject: 'users' identifier
   * // - expr: binary expression '.age > 18'
   * // - relative: true (because subParser.isRelative() returns true)
   * ```
   *
   * @example Static filter (property access)
   * ```typescript
   * // For "config['api' + 'Key']"
   * // Creates FilterExpression with:
   * // - subject: 'config' identifier
   * // - expr: binary expression '"api" + "Key"'
   * // - relative: false (no relative identifiers in expression)
   * ```
   *
   * @example Dynamic array indexing
   * ```typescript
   * // For "items[currentIndex + 1]"
   * // Creates FilterExpression for computed array access
   * ```
   */
  filter(ast) {
    this._placeBeforeCursor({
      type: "FilterExpression",
      expr: ast,
      relative: this._subParser.isRelative(),
      subject: this._cursor
    });
  }
  /**
   * Handles identifier tokens when used to indicate the name of a function to
   * be called.
   */
  functionCall() {
    if (this._cursor && this._cursor.type === "FunctionCall" && this._cursor.pool === "transforms") {
      return;
    }
    const functionName = this._buildFullIdentifierPath(this._cursor || null);
    this._placeBeforeCursor({
      type: "FunctionCall",
      name: functionName,
      args: [],
      pool: "functions"
    });
  }
  /**
   * Builds the full namespace path for an identifier by traversing the 'from' chain.
   * This supports namespace functions like 'My.sayHi' by building the complete name.
   *
   * @param node - The identifier node to build the path for
   * @returns The full namespace path as a string
   *
   * @example
   * // For identifier chain: My.sayHi
   * // Returns: "My.sayHi"
   *
   * @example
   * // For simple identifier: sayHi
   * // Returns: "sayHi"
   */
  _buildFullIdentifierPath(node) {
    if (!node || node.type !== "Identifier") {
      return node?.value || "";
    }
    const parts = [];
    let current = node;
    while (current && current.type === "Identifier") {
      parts.unshift(current.value);
      current = current.from || null;
    }
    return parts.join(".");
  }
  /**
   * Handles identifier tokens by creating Identifier AST nodes.
   *
   * Identifiers represent variable names, property names, or function names. Their placement
   * in the AST depends on context - they can be standalone, part of a property chain, or
   * relative to a filter context.
   *
   * @param token - Identifier token with the name value
   *
   * @example Simple identifier
   * ```typescript
   * // For "username"
   * // Creates: { type: 'Identifier', value: 'username' }
   * ```
   *
   * @example Property access
   * ```typescript
   * // For "user.name" - when processing 'name' after dot
   * // Creates: { type: 'Identifier', value: 'name', from: userIdentifier }
   * ```
   *
   * @example Relative identifier in filter
   * ```typescript
   * // For ".age" in filter context
   * // Creates: { type: 'Identifier', value: 'age', relative: true }
   * ```
   *
   * @example Function name
   * ```typescript
   * // For "max(" - identifier before parentheses
   * // Later converted to FunctionCall node by functionCall handler
   * ```
   */
  identifier(token) {
    const node = {
      type: "Identifier",
      value: token.value
    };
    if (this._nextIdentEncapsulate && this._cursor && this._cursor.type === "FunctionCall" && this._cursor.pool === "transforms") {
      const namespaceParts = [];
      namespaceParts.push(this._cursor.name);
      namespaceParts.push(token.value);
      const namespacedTransformName = namespaceParts.join(".");
      this._cursor.name = namespacedTransformName;
      this._nextIdentEncapsulate = false;
      return;
    }
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
  }
  /**
   * Handles literal value tokens (strings, numbers, booleans, null).
   *
   * Literals represent constant values in expressions. They are the simplest AST nodes
   * and are always leaf nodes (no children).
   *
   * @param token - Literal token containing the parsed value
   *
   * @example String literal
   * ```typescript
   * // For '"Hello World"'
   * // Creates: { type: 'Literal', value: 'Hello World' }
   * ```
   *
   * @example Number literal
   * ```typescript
   * // For '42.5'
   * // Creates: { type: 'Literal', value: 42.5 }
   * ```
   *
   * @example Boolean literal
   * ```typescript
   * // For 'true'
   * // Creates: { type: 'Literal', value: true }
   * ```
   *
   * @example Null literal
   * ```typescript
   * // For 'null'
   * // Creates: { type: 'Literal', value: null }
   * ```
   */
  literal(token) {
    this._placeAtCursor({
      type: "Literal",
      value: token.value
    });
  }
  /**
   * Queues a new object literal key to be written once a value is collected.
   * @param token A token object
   */
  objKey(token) {
    this._curObjKey = token.value;
  }
  /**
   * Handles new object literals by adding them as a new node in the AST,
   * initialized with an empty object.
   */
  objStart() {
    this._placeAtCursor({
      type: "ObjectLiteral",
      value: {}
    });
  }
  /**
   * Handles an object value by adding its AST to the queued key on the object
   * literal node currently at the cursor.
   * @param ast The sub expression tree
   */
  objVal(ast) {
    if (this._cursor && this._curObjKey) {
      ;
      this._cursor.value[this._curObjKey] = ast;
    }
  }
  /**
   * Handles traditional sub expressions, delineated with the groupStart and
   * groupEnd elements.
   * @param ast The sub expression tree
   */
  subExpression(ast) {
    this._placeAtCursor(ast);
  }
  /**
   * Handles a completed alternate sub expression of a ternary operator.
   * @param ast The sub expression tree
   */
  ternaryEnd(ast) {
    if (this._cursor) {
      this._cursor.alternate = ast;
    }
  }
  /**
   * Handles a completed consequent sub expression of a ternary operator.
   * @param ast The sub expression tree
   */
  ternaryMid(ast) {
    if (this._cursor) {
      this._cursor.consequent = ast;
    }
  }
  /**
   * Initiates a ternary conditional expression by wrapping the current AST as the test condition.
   *
   * Ternary expressions have the form: test ? consequent : alternate
   * This method is called when the '?' token is encountered.
   *
   * @example Standard ternary
   * ```typescript
   * // For "age >= 18 ? 'adult' : 'minor'"
   * // When '?' is encountered, wraps existing "age >= 18" as test:
   * // {
   * //   type: 'ConditionalExpression',
   * //   test: { type: 'BinaryExpression', ... },  // age >= 18
   * //   consequent: undefined,  // will be set by ternaryMid
   * //   alternate: undefined    // will be set by ternaryEnd
   * // }
   * ```
   *
   * @example Elvis operator (missing consequent)
   * ```typescript
   * // For "nickname ?: 'Anonymous'"
   * // Similar structure but consequent will remain undefined
   * // Evaluator will use test result as consequent
   * ```
   */
  ternaryStart() {
    this._tree = {
      type: "ConditionalExpression",
      test: this._tree || void 0
    };
    this._cursor = this._tree;
  }
  /**
   * Converts an identifier token into a transform function call.
   *
   * Transform functions are applied using the pipe operator (|). This method converts
   * the identifier following a pipe into a FunctionCall node in the transforms pool.
   * Supports namespace transforms like 'String.upper' or 'Utils.format'.
   *
   * @param token - Identifier token with the transform function name
   *
   * @example Simple transform
   * ```typescript
   * // For "name|upper"
   * // When processing 'upper' after pipe:
   * // Creates: {
   * //   type: 'FunctionCall',
   * //   name: 'upper',
   * //   args: [nameIdentifier],  // current cursor becomes first argument
   * //   pool: 'transforms'
   * // }
   * ```
   *
   * @example Namespace transform
   * ```typescript
   * // For "name|String.upper"
   * // When processing 'String.upper' after pipe:
   * // Creates: {
   * //   type: 'FunctionCall',
   * //   name: 'String.upper',
   * //   args: [nameIdentifier],
   * //   pool: 'transforms'
   * // }
   * ```
   *
   * @example Transform with arguments
   * ```typescript
   * // For "value|Utils.multiply(2, 3)"
   * // Creates FunctionCall node, args will be populated by argVal handler:
   * // {
   * //   type: 'FunctionCall',
   * //   name: 'Utils.multiply',
   * //   args: [valueIdentifier, 2, 3],
   * //   pool: 'transforms'
   * // }
   * ```
   *
   * @example Chained transforms
   * ```typescript
   * // For "name|String.lower|String.trim"
   * // Each transform becomes a FunctionCall wrapping the previous result
   * ```
   */
  transform(token) {
    const transformName = token.value;
    this._placeBeforeCursor({
      type: "FunctionCall",
      name: transformName,
      args: this._cursor ? [this._cursor] : [],
      pool: "transforms"
    });
  }
  /**
   * Handles token of type 'unaryOp', indicating that the operation has only
   * one input: a right side.
   * @param token A token object
   */
  unaryOp(token) {
    this._placeAtCursor({
      type: "UnaryExpression",
      operator: token.value
    });
  }
  /**
   * Maps token types to their corresponding handler methods
   * @param tokenType The type of token to handle
   * @returns The handler method for this token type
   * @private
   */
  _getHandlerMethod(tokenType) {
    switch (tokenType) {
      case "binaryOp":
        return this.binaryOp.bind(this);
      case "dot":
        return () => this.dot();
      case "identifier":
        return this.identifier.bind(this);
      case "literal":
        return this.literal.bind(this);
      case "unaryOp":
        return this.unaryOp.bind(this);
      case "pipe":
        return () => this.pipe();
      default:
        return void 0;
    }
  }
  /**
   * Handles pipe (|) tokens for transform operations.
   *
   * Special handling for cases where a pipe follows a dot in traverse state,
   * indicating a standalone relative identifier for transforms like .|transform.
   */
  pipe() {
    if (this._state === "traverse") {
      this._placeAtCursor({
        type: "Identifier",
        value: ".",
        relative: true
      });
      this._relative = true;
    }
  }
  /**
   * Maps token handler names to their corresponding handler methods
   * @param handlerName The name of the token handler to handle
   * @returns The handler method for this token handler name
   * @private
   */
  _getTokenHandlerMethod(handlerName) {
    switch (handlerName) {
      case "arrayStart":
        return () => this.arrayStart();
      case "functionCall":
        return () => this.functionCall();
      case "objKey":
        return this.objKey.bind(this);
      case "objStart":
        return () => this.objStart();
      case "ternaryStart":
        return () => this.ternaryStart();
      case "transform":
        return this.transform.bind(this);
      default:
        return void 0;
    }
  }
  /**
   * Maps subHandler names to their corresponding handler methods
   * @param handlerName The name of the subHandler to handle
   * @returns The handler method for this subHandler name
   * @private
   */
  _getSubHandlerMethod(handlerName) {
    switch (handlerName) {
      case "argVal":
        return this.argVal.bind(this);
      case "arrayVal":
        return this.arrayVal.bind(this);
      case "filter":
        return this.filter.bind(this);
      case "objVal":
        return this.objVal.bind(this);
      case "subExpression":
        return this.subExpression.bind(this);
      case "ternaryEnd":
        return this.ternaryEnd.bind(this);
      case "ternaryMid":
        return this.ternaryMid.bind(this);
      default:
        return void 0;
    }
  }
  // ===== Private Handler Methods =====
  //
  // The following methods handle specific token types and AST node construction.
  // They are called by the state machine based on current state and token type.
  //
  // Handler methods fall into several categories:
  // 1. Token handlers: Process individual tokens (identifier, literal, binaryOp, etc.)
  // 2. Structure handlers: Handle compound structures (arrays, objects, functions)
  // 3. Sub expression handlers: Process completed sub expressions (filter, argVal, etc.)
  // 4. State transition handlers: Manage parser state changes (dot, ternaryStart, etc.)
  //
  // The parser uses a cursor-based approach where _cursor points to the current
  // position in the AST where new nodes should be added or where modifications
  // should be made.
};

// src/Validator.ts
var ValidationSeverity = /* @__PURE__ */ ((ValidationSeverity2) => {
  ValidationSeverity2["ERROR"] = "error";
  ValidationSeverity2["WARNING"] = "warning";
  ValidationSeverity2["INFO"] = "info";
  return ValidationSeverity2;
})(ValidationSeverity || {});
var Validator = class {
  _grammar;
  _lexer;
  /**
   * Creates a new Validator instance.
   *
   * @param grammar The Jexl grammar configuration to use for validation
   *
   * @example
   * ```typescript
   * import { Jexl } from '@pawel-up/jexl'
   * import { Validator } from '@pawel-up/jexl'
   *
   * const jexl = new Jexl()
   * const validator = new Validator(jexl.grammar)
   * ```
   */
  constructor(grammar) {
    this._grammar = grammar;
    this._lexer = new Lexer(grammar);
  }
  /**
   * Validates a Jexl expression and returns detailed validation results.
   *
   * @param expression The Jexl expression string to validate
   * @param context Optional context object for strict validation
   * @param options Validation configuration options
   * @returns Comprehensive validation results
   *
   * @example
   * ```typescript
   * // Basic syntax validation
   * const result = validator.validate('user.name | upper')
   *
   * // Strict validation with context
   * const strictResult = validator.validate(
   *   'user.profile.email',
   *   { user: { name: 'John' } }, // missing profile
   *   { allowUndefinedContext: false }
   * )
   *
   * // Development mode validation
   * const devResult = validator.validate(
   *   'items | filter("active") | map("name")',
   *   {},
   *   {
   *     allowUndefinedContext: true,
   *     includeInfo: true,
   *     includeWarnings: true
   *   }
   * )
   *
   * // Check results
   * if (!result.valid) {
   *   result.errors.forEach(error => {
   *     console.log(`Error at ${error.line}:${error.column}: ${error.message}`)
   *   })
   * }
   *
   * if (result.warnings.length > 0) {
   *   console.log('Warnings:', result.warnings.map(w => w.message))
   * }
   * ```
   */
  validate(expression, context, options = {}) {
    const issues = [];
    const opts = this._getDefaultOptions(options);
    if (!expression || typeof expression !== "string") {
      issues.push({
        severity: "error" /* ERROR */,
        message: "Expression must be a non-empty string",
        code: "INVALID_INPUT"
      });
      return this._createResult(issues);
    }
    const trimmedExpression = expression.trim();
    if (trimmedExpression.length === 0) {
      issues.push({
        severity: "error" /* ERROR */,
        message: "Expression cannot be empty or whitespace only",
        code: "INVALID_INPUT"
      });
      return this._createResult(issues);
    }
    if (opts.maxLength && expression.length > opts.maxLength) {
      issues.push({
        severity: "warning" /* WARNING */,
        message: `Expression length (${expression.length}) exceeds recommended maximum (${opts.maxLength})`,
        code: "EXPRESSION_TOO_LONG"
      });
    }
    try {
      this._validateLexical(trimmedExpression, issues);
      if (this._hasErrors(issues)) {
        return this._createResult(issues);
      }
      const ast = this._validateSyntax(trimmedExpression, issues);
      if (this._hasErrors(issues) || !ast) {
        return this._createResult(issues);
      }
      this._validateSemantics(ast, trimmedExpression, issues, opts);
      if (!opts.allowUndefinedContext && context !== void 0) {
        this._validateContext(ast, context, trimmedExpression, issues, opts);
      }
      if (opts.includeWarnings) {
        this._performWarningAnalysis(ast, trimmedExpression, issues);
      }
      if (opts.includeInfo) {
        this._performInfoAnalysis(ast, trimmedExpression, issues);
      }
      return this._createResult(issues, ast);
    } catch (error) {
      issues.push({
        severity: "error" /* ERROR */,
        message: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        code: "VALIDATION_ERROR"
      });
      return this._createResult(issues);
    }
  }
  /**
   * Quick validation check that only returns whether the expression is syntactically valid.
   * Useful for real-time validation in editors where detailed analysis isn't needed.
   *
   * @param expression The expression to validate
   * @returns True if the expression has valid syntax
   *
   * @example
   * ```typescript
   * // Quick syntax check
   * if (validator.isValid('user.name | upper')) {
   *   console.log('Expression syntax is valid')
   * }
   *
   * // Use in form validation
   * const isExpressionValid = validator.isValid(userInput)
   * setFieldError(isExpressionValid ? null : 'Invalid expression syntax')
   * ```
   */
  isValid(expression) {
    try {
      const result = this.validate(
        expression,
        {},
        {
          allowUndefinedContext: true,
          includeWarnings: false,
          includeInfo: false
        }
      );
      return result.valid;
    } catch {
      return false;
    }
  }
  /**
   * Validates expression syntax and returns the first error found, or null if valid.
   * Useful for providing immediate feedback in development tools.
   *
   * @param expression The expression to validate
   * @returns The first error found, or null if valid
   *
   * @example
   * ```typescript
   * const error = validator.getFirstError('user.name |')
   * if (error) {
   *   console.log(`Syntax error: ${error.message}`)
   *   if (error.line && error.column) {
   *     console.log(`at line ${error.line}, column ${error.column}`)
   *   }
   * }
   * ```
   */
  getFirstError(expression) {
    const result = this.validate(
      expression,
      {},
      {
        allowUndefinedContext: true,
        includeWarnings: false,
        includeInfo: false
      }
    );
    return result.errors[0] || null;
  }
  /**
   * Performs lexical validation by tokenizing the expression.
   * @private
   */
  _validateLexical(expression, issues) {
    try {
      const tokens = this._lexer.tokenize(expression);
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const nextToken = tokens[i + 1];
        if (token.type === "binaryOp" && nextToken?.type === "binaryOp") {
          const position = this._findTokenPosition(expression, token.raw);
          issues.push({
            severity: "error" /* ERROR */,
            message: `Consecutive operators: '${token.value}' followed by '${nextToken.value}'`,
            startPosition: position,
            endPosition: position + token.raw.length,
            token: token.raw,
            code: "CONSECUTIVE_OPERATORS",
            ...this._getLineColumn(expression, position)
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lexical analysis failed";
      const match = message.match(/Invalid expression token: (.+)/);
      if (match) {
        const invalidToken = match[1];
        const position = expression.indexOf(invalidToken);
        issues.push({
          severity: "error" /* ERROR */,
          message: `Invalid token: '${invalidToken}'`,
          startPosition: position >= 0 ? position : void 0,
          endPosition: position >= 0 ? position + invalidToken.length : void 0,
          token: invalidToken,
          code: "INVALID_TOKEN",
          ...this._getLineColumn(expression, position >= 0 ? position : 0)
        });
      } else {
        issues.push({
          severity: "error" /* ERROR */,
          message,
          code: "LEXICAL_ERROR"
        });
      }
    }
  }
  /**
   * Performs syntax validation by parsing the expression into an AST.
   * @private
   */
  _validateSyntax(expression, issues) {
    try {
      const parser = new Parser(this._grammar);
      const tokens = this._lexer.tokenize(expression);
      parser.addTokens(tokens);
      const ast = parser.complete();
      return ast;
    } catch (error) {
      const originalMessage = error instanceof Error ? error.message : "Parse error";
      const message = `Syntax error: ${originalMessage}`;
      let position;
      let token;
      const unexpectedMatch = message.match(/Unexpected token (.+)/);
      if (unexpectedMatch) {
        token = unexpectedMatch[1];
        position = expression.indexOf(token);
      }
      issues.push({
        severity: "error" /* ERROR */,
        message,
        startPosition: position,
        endPosition: position !== void 0 && token ? position + token.length : void 0,
        token,
        code: "SYNTAX_ERROR",
        ...this._getLineColumn(expression, position || 0)
      });
      return null;
    }
  }
  /**
   * Performs semantic validation of the AST.
   * @private
   */
  _validateSemantics(ast, expression, issues, options) {
    this._validateASTNode(ast, expression, issues, options, 0);
  }
  /**
   * Recursively validates an AST node and its children.
   * @private
   */
  _validateASTNode(node, expression, issues, options, depth) {
    if (!node) return;
    if (options.maxDepth && depth > options.maxDepth) {
      issues.push({
        severity: "warning" /* WARNING */,
        message: `Expression depth (${depth}) exceeds recommended maximum (${options.maxDepth})`,
        code: "EXPRESSION_TOO_DEEP"
      });
      return;
    }
    switch (node.type) {
      case "FunctionCall":
        this._validateFunction(node, expression, issues, options);
        break;
      case "BinaryExpression":
        this._validateBinaryExpression(node, expression, issues);
        break;
      case "UnaryExpression":
        this._validateUnaryExpression(node, expression, issues);
        break;
    }
    switch (node.type) {
      case "BinaryExpression":
        const binaryNode = node;
        this._validateASTNode(binaryNode.left, expression, issues, options, depth + 1);
        this._validateASTNode(binaryNode.right, expression, issues, options, depth + 1);
        break;
      case "UnaryExpression":
        const unaryNode = node;
        this._validateASTNode(unaryNode.right, expression, issues, options, depth + 1);
        break;
      case "ConditionalExpression":
        const conditionalNode = node;
        this._validateASTNode(conditionalNode.test, expression, issues, options, depth + 1);
        this._validateASTNode(conditionalNode.consequent, expression, issues, options, depth + 1);
        this._validateASTNode(conditionalNode.alternate, expression, issues, options, depth + 1);
        break;
      case "FilterExpression":
        const filterNode = node;
        this._validateASTNode(filterNode.subject, expression, issues, options, depth + 1);
        this._validateASTNode(filterNode.expr, expression, issues, options, depth + 1);
        break;
      case "Identifier":
        const identifierNode = node;
        if (identifierNode.from) {
          this._validateASTNode(identifierNode.from, expression, issues, options, depth + 1);
        }
        break;
      case "FunctionCall":
        const functionNode = node;
        if (functionNode.args) {
          functionNode.args.forEach((arg) => {
            this._validateASTNode(arg, expression, issues, options, depth + 1);
          });
        }
        break;
      case "ArrayLiteral":
        const arrayNode = node;
        arrayNode.value.forEach((item) => {
          this._validateASTNode(item, expression, issues, options, depth + 1);
        });
        break;
      case "ObjectLiteral":
        const objectNode = node;
        Object.values(objectNode.value).forEach((value) => {
          this._validateASTNode(value, expression, issues, options, depth + 1);
        });
        break;
    }
  }
  /**
   * Validates function calls.
   * @private
   */
  _validateFunction(node, _expression, issues, options) {
    const funcName = node.name;
    if (!funcName) return;
    const isBuiltIn = this._grammar.functions[funcName] !== void 0;
    const isCustom = options.customFunctions.includes(funcName);
    if (!isBuiltIn && !isCustom && node.pool === "functions") {
      issues.push({
        severity: "error" /* ERROR */,
        message: `Unknown function: '${funcName}'`,
        token: funcName,
        code: "UNKNOWN_FUNCTION"
      });
    }
    if (!isBuiltIn && !isCustom && node.pool === "transforms") {
      const isBuiltInTransform = this._grammar.transforms[funcName] !== void 0;
      const isCustomTransform = options.customTransforms.includes(funcName);
      if (!isBuiltInTransform && !isCustomTransform) {
        issues.push({
          severity: "error" /* ERROR */,
          message: `Unknown transform: '${funcName}'`,
          token: funcName,
          code: "UNKNOWN_TRANSFORM"
        });
      }
    }
  }
  /**
   * Validates binary expressions.
   * @private
   */
  _validateBinaryExpression(node, _expression, issues) {
    const operator = node.operator;
    if (!operator) return;
    const isBuiltIn = this._grammar.elements[operator] !== void 0;
    if (!isBuiltIn) {
      issues.push({
        severity: "error" /* ERROR */,
        message: `Unknown binary operator: '${operator}'`,
        token: operator,
        code: "UNKNOWN_OPERATOR"
      });
    }
  }
  /**
   * Validates unary expressions.
   * @private
   */
  _validateUnaryExpression(node, _expression, issues) {
    const operator = node.operator;
    if (!operator) return;
    const isBuiltIn = this._grammar.elements[operator] !== void 0;
    if (!isBuiltIn) {
      issues.push({
        severity: "error" /* ERROR */,
        message: `Unknown unary operator: '${operator}'`,
        token: operator,
        code: "UNKNOWN_OPERATOR"
      });
    }
  }
  _validateContext(ast, context, expression, issues, options) {
    this._validateContextPath(ast, context, context, expression, issues, options);
  }
  /**
   * Recursively validates an AST node's context path.
   * @param node The AST node to validate
   * @param localContext The current context for this node
   * @param globalContext The top-level context
   * @param expression The full expression string
   * @param issues The array of issues to populate
   * @param options Validation options
   * @returns The resolved value from the context if the path is valid and static, otherwise undefined.
   * @private
   */
  _validateContextPath(node, localContext, globalContext, expression, issues, options) {
    if (!node) return void 0;
    switch (node.type) {
      case "Identifier":
        const idNode = node;
        if (idNode.from) {
          const parentContext = this._validateContextPath(
            idNode.from,
            localContext,
            globalContext,
            expression,
            issues,
            options
          );
          if (parentContext === void 0) {
            return void 0;
          }
          if (parentContext === null) {
            issues.push({
              severity: "warning" /* WARNING */,
              message: `Cannot access property '${idNode.value}' of null`,
              token: idNode.value,
              code: "PROPERTY_ACCESS_ON_NULL"
            });
            return void 0;
          }
          if (typeof parentContext !== "object") {
            issues.push({
              severity: "warning" /* WARNING */,
              message: `Cannot access property '${idNode.value}' on non-object value of type ${typeof parentContext}`,
              token: idNode.value,
              code: "PROPERTY_ACCESS_ON_NON_OBJECT"
            });
            return void 0;
          }
          if (!(idNode.value in parentContext)) {
            issues.push({
              severity: "warning" /* WARNING */,
              message: `Property '${idNode.value}' not found on object`,
              token: idNode.value,
              code: "UNDEFINED_PROPERTY"
            });
            return void 0;
          }
          return parentContext[idNode.value];
        }
        if (idNode.relative) {
          if (!idNode.value) {
            return localContext;
          }
          const parentContext = localContext;
          if (parentContext === null) {
            issues.push({
              severity: "warning" /* WARNING */,
              message: `Cannot access property '${idNode.value}' of null`,
              token: idNode.value,
              code: "PROPERTY_ACCESS_ON_NULL"
            });
            return void 0;
          }
          if (typeof parentContext !== "object") {
            issues.push({
              severity: "warning" /* WARNING */,
              message: `Cannot access property '${idNode.value}' on non-object value of type ${typeof parentContext}`,
              token: idNode.value,
              code: "PROPERTY_ACCESS_ON_NON_OBJECT"
            });
            return void 0;
          }
          if (!(idNode.value in parentContext)) {
            issues.push({
              severity: "warning" /* WARNING */,
              message: `Property '${idNode.value}' not found on relative context object`,
              token: idNode.value,
              code: "UNDEFINED_PROPERTY"
            });
            return void 0;
          }
          return parentContext[idNode.value];
        }
        if (typeof globalContext === "object" && globalContext !== null && idNode.value in globalContext) {
          return globalContext[idNode.value];
        }
        issues.push({
          severity: "warning" /* WARNING */,
          message: `Identifier '${idNode.value}' not found in context`,
          token: idNode.value,
          code: "UNDEFINED_IDENTIFIER"
        });
        return void 0;
      case "Literal":
        return node.value;
      case "ArrayLiteral":
        const arrayNode = node;
        return arrayNode.value.map(
          (item) => this._validateContextPath(item, localContext, globalContext, expression, issues, options)
        );
      case "ObjectLiteral":
        const objectNode = node;
        const newObj = {};
        for (const key in objectNode.value) {
          newObj[key] = this._validateContextPath(
            objectNode.value[key],
            localContext,
            globalContext,
            expression,
            issues,
            options
          );
        }
        return newObj;
      case "BinaryExpression":
        const binaryNode = node;
        this._validateContextPath(binaryNode.left, localContext, globalContext, expression, issues, options);
        this._validateContextPath(binaryNode.right, localContext, globalContext, expression, issues, options);
        return void 0;
      // Result of binary expression is dynamic
      case "UnaryExpression":
        const unaryNode = node;
        this._validateContextPath(unaryNode.right, localContext, globalContext, expression, issues, options);
        return void 0;
      // Result of unary expression is dynamic
      case "ConditionalExpression":
        const conditionalNode = node;
        this._validateContextPath(conditionalNode.test, localContext, globalContext, expression, issues, options);
        this._validateContextPath(conditionalNode.consequent, localContext, globalContext, expression, issues, options);
        this._validateContextPath(conditionalNode.alternate, localContext, globalContext, expression, issues, options);
        return void 0;
      // Result of conditional is dynamic
      case "FilterExpression":
        const filterNode = node;
        const subjectContext = this._validateContextPath(
          filterNode.subject,
          localContext,
          globalContext,
          expression,
          issues,
          options
        );
        if (subjectContext === void 0) return void 0;
        if (filterNode.relative) {
          if (!Array.isArray(subjectContext)) {
            if (subjectContext !== void 0) {
              issues.push({
                severity: "warning" /* WARNING */,
                message: "Relative filter expression used on non-array value",
                code: "FILTER_ON_NON_ARRAY"
              });
            }
            return void 0;
          }
          const relativeContext = subjectContext.length > 0 ? subjectContext[0] : {};
          this._validateContextPath(filterNode.expr, relativeContext, globalContext, expression, issues, options);
        } else {
          this._validateContextPath(filterNode.expr, localContext, globalContext, expression, issues, options);
        }
        return void 0;
      // Result of a filter is dynamic
      case "FunctionCall":
        const functionNode = node;
        if (functionNode.args) {
          functionNode.args.forEach(
            (arg) => this._validateContextPath(arg, localContext, globalContext, expression, issues, options)
          );
        }
        return void 0;
    }
    return void 0;
  }
  /**
   * Performs additional warning analysis.
   * @private
   */
  _performWarningAnalysis(ast, _expression, issues) {
    const nodeCount = this._countNodes(ast);
    if (nodeCount > 50) {
      issues.push({
        severity: "warning" /* WARNING */,
        message: `Complex expression with ${nodeCount} nodes may impact performance`,
        code: "COMPLEX_EXPRESSION"
      });
    }
  }
  /**
   * Performs informational analysis.
   * @private
   */
  _performInfoAnalysis(ast, _expression, issues) {
    const nodeCount = this._countNodes(ast);
    issues.push({
      severity: "info" /* INFO */,
      message: `Expression contains ${nodeCount} nodes`,
      code: "EXPRESSION_STATS"
    });
  }
  /**
   * Gets default validation options.
   * @private
   */
  _getDefaultOptions(options) {
    return {
      allowUndefinedContext: true,
      includeInfo: false,
      includeWarnings: true,
      maxDepth: 20,
      maxLength: 1e3,
      customFunctions: [],
      customTransforms: [],
      ...options
    };
  }
  /**
   * Creates a validation result object.
   * @private
   */
  _createResult(issues, ast) {
    const errors = issues.filter((i) => i.severity === "error" /* ERROR */);
    const warnings = issues.filter((i) => i.severity === "warning" /* WARNING */);
    const info = issues.filter((i) => i.severity === "info" /* INFO */);
    return {
      valid: errors.length === 0,
      issues: issues.sort((a, b) => (a.startPosition || 0) - (b.startPosition || 0)),
      errors,
      warnings,
      info,
      ast
    };
  }
  /**
   * Checks if there are any error-level issues.
   * @private
   */
  _hasErrors(issues) {
    return issues.some((issue) => issue.severity === "error" /* ERROR */);
  }
  /**
   * Finds the position of a token in the expression.
   * @private
   */
  _findTokenPosition(expression, tokenRaw) {
    return expression.indexOf(tokenRaw.trim());
  }
  /**
   * Gets line and column information for a character position.
   * @private
   */
  _getLineColumn(expression, position) {
    const lines = expression.substring(0, position).split("\n");
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }
  /**
   * Counts the total number of nodes in an AST.
   * @private
   */
  _countNodes(node) {
    if (!node) return 0;
    let count = 1;
    switch (node.type) {
      case "BinaryExpression":
        const binaryNode = node;
        count += this._countNodes(binaryNode.left);
        count += this._countNodes(binaryNode.right);
        break;
      case "UnaryExpression":
        const unaryNode = node;
        count += this._countNodes(unaryNode.right);
        break;
      case "ConditionalExpression":
        const conditionalNode = node;
        count += this._countNodes(conditionalNode.test);
        count += this._countNodes(conditionalNode.consequent);
        count += this._countNodes(conditionalNode.alternate);
        break;
      case "FilterExpression":
        const filterNode = node;
        count += this._countNodes(filterNode.subject);
        count += this._countNodes(filterNode.expr);
        break;
      case "Identifier":
        const identifierNode = node;
        if (identifierNode.from) {
          count += this._countNodes(identifierNode.from);
        }
        break;
      case "FunctionCall":
        const functionNode = node;
        if (functionNode.args) {
          count += functionNode.args.reduce((sum, arg) => sum + this._countNodes(arg), 0);
        }
        break;
      case "ArrayLiteral":
        const arrayNode = node;
        count += arrayNode.value.reduce((sum, item) => sum + this._countNodes(item), 0);
        break;
      case "ObjectLiteral":
        const objectNode = node;
        count += Object.values(objectNode.value).reduce(
          (sum, value) => sum + this._countNodes(value),
          0
        );
        break;
    }
    return count;
  }
};

// src/evaluator/Evaluator.ts
var poolNames = {
  functions: "Jexl Function",
  transforms: "Transform"
};
var Evaluator = class _Evaluator {
  /**
   * The grammar object containing operators, functions, and transforms used for evaluation.
   * This defines the language rules and available operations for expressions.
   *
   * @example
   * ```typescript
   * const grammar = {
   *   elements: { '+': { type: 'binaryOp', eval: (a, b) => a + b } },
   *   functions: { max: Math.max },
   *   transforms: { upper: (s: string) => s.toUpperCase() }
   * }
   * ```
   */
  _grammar;
  /**
   * The main context object containing variables and values accessible in expressions.
   * Non-relative identifiers (like `user.name`) are resolved against this context.
   *
   * @example
   * ```typescript
   * const context = {
   *   user: { name: 'Alice', age: 25 },
   *   settings: { theme: 'dark' },
   *   data: [1, 2, 3, 4, 5]
   * }
   * // Expression "user.name" resolves to "Alice"
   * // Expression "settings.theme" resolves to "dark"
   * ```
   */
  _context;
  /**
   * The relative context used for resolving relative identifiers (those starting with `.`).
   * This is typically used in filter expressions where each array element becomes the relative context.
   *
   * @example
   * ```typescript
   * // When filtering users[.age > 18]:
   * // For each user object like { name: 'Bob', age: 25 }
   * // The relative context becomes that user object
   * // So ".age" resolves to 25 for that iteration
   * const users = [
   *   { name: 'Alice', age: 25 },
   *   { name: 'Bob', age: 17 }
   * ]
   * // During filter evaluation, _relContext = { name: 'Alice', age: 25 } for first user
   * ```
   */
  _relContext;
  /**
   * Creates a new Evaluator instance for executing Jexl expressions.
   *
   * @param grammar - Grammar object containing operators, functions, and transforms
   * @param context - Main variable context for resolving non-relative identifiers
   * @param relativeContext - Context for resolving relative identifiers (defaults to main context)
   *
   * @example Creating an evaluator
   * ```typescript
   * const grammar = getGrammar()
   * const context = {
   *   user: { name: 'John', posts: 5 },
   *   threshold: 10
   * }
   * const evaluator = new Evaluator(grammar, context)
   * ```
   *
   * @example With custom relative context
   * ```typescript
   * const currentUser = { name: 'Admin', role: 'admin' }
   * const evaluator = new Evaluator(grammar, globalContext, currentUser)
   * // Now relative identifiers like ".name" resolve to "Admin"
   * ```
   */
  constructor(grammar, context, relativeContext) {
    this._grammar = grammar;
    this._context = context || {};
    this._relContext = relativeContext || this._context;
  }
  /**
   * Evaluates a Jexl expression tree (AST) and returns the computed result.
   *
   * This is the main entry point for expression evaluation. It processes the AST node
   * based on its type and delegates to the appropriate handler method.
   *
   * @param ast - The expression tree node to evaluate
   * @returns Promise resolving to the evaluation result
   *
   * @example Basic evaluation
   * ```typescript
   * // For expression "user.age + 10"
   * const ast = {
   *   type: 'BinaryExpression',
   *   operator: '+',
   *   left: { type: 'Identifier', value: 'user', from: { type: 'Identifier', value: 'age' } },
   *   right: { type: 'Literal', value: 10 }
   * }
   * const result = await evaluator.eval(ast) // Returns 35 if user.age is 25
   * ```
   *
   * @example Complex evaluation
   * ```typescript
   * // For expression "users[.active].length > 0"
   * const result = await evaluator.eval(complexAst)
   * // Returns true if there are active users, false otherwise
   * ```
   *
   * @throws {Error} When encountering unknown AST node types or evaluation errors
   */
  async eval(ast) {
    switch (ast.type) {
      case "ArrayLiteral":
        return this._handleArrayLiteral(ast);
      case "BinaryExpression":
        return this._handleBinaryExpression(ast);
      case "ConditionalExpression":
        return this._handleConditionalExpression(ast);
      case "FilterExpression":
        return this._handleFilterExpression(ast);
      case "Identifier":
        return this._handleIdentifier(ast);
      case "Literal":
        return this._handleLiteral(ast);
      case "ObjectLiteral":
        return this._handleObjectLiteral(ast);
      case "FunctionCall":
        return this._handleFunctionCall(ast);
      case "UnaryExpression":
        return this._handleUnaryExpression(ast);
      default:
        throw new Error(`Unknown AST node type: ${ast.type}`);
    }
  }
  /**
   * Evaluates an array of expression trees in parallel and returns results in the same order.
   *
   * This method is useful for evaluating multiple expressions simultaneously, such as
   * function arguments, array elements, or object property values.
   *
   * @param arr - Array of expression tree nodes to evaluate
   * @returns Promise resolving to array of evaluation results in the same order
   *
   * @example Evaluating function arguments
   * ```typescript
   * // For function call "max(user.score, 100, bonus)"
   * const args = [
   *   { type: 'Identifier', value: 'user', from: { type: 'Identifier', value: 'score' } },
   *   { type: 'Literal', value: 100 },
   *   { type: 'Identifier', value: 'bonus' }
   * ]
   * const results = await evaluator.evalArray(args)
   * // Returns [85, 100, 15] if user.score=85 and bonus=15
   * ```
   *
   * @example Evaluating array literal elements
   * ```typescript
   * // For array literal "[name, age * 2, active]"
   * const elements = [
   *   { type: 'Identifier', value: 'name' },
   *   { type: 'BinaryExpression', operator: '*', left: {...}, right: {...} },
   *   { type: 'Identifier', value: 'active' }
   * ]
   * const results = await evaluator.evalArray(elements)
   * // Returns ['John', 50, true] if name='John', age=25, active=true
   * ```
   */
  evalArray(arr) {
    return Promise.all(arr.map((elem) => this.eval(elem)));
  }
  /**
   * Evaluates a map of expression trees in parallel and returns a map with the same keys.
   *
   * This method is primarily used for evaluating object literal properties where each
   * property value is an expression that needs to be evaluated.
   *
   * @param map - Map from property names to expression tree nodes
   * @returns Promise resolving to map with same keys but evaluated values
   *
   * @example Evaluating object literal
   * ```typescript
   * // For object literal "{ fullName: name + ' ' + surname, isAdult: age >= 18 }"
   * const map = {
   *   fullName: {
   *     type: 'BinaryExpression',
   *     operator: '+',
   *     left: { type: 'Identifier', value: 'name' },
   *     right: { type: 'BinaryExpression', operator: '+', ... }
   *   },
   *   isAdult: {
   *     type: 'BinaryExpression',
   *     operator: '>=',
   *     left: { type: 'Identifier', value: 'age' },
   *     right: { type: 'Literal', value: 18 }
   *   }
   * }
   * const result = await evaluator.evalMap(map)
   * // Returns { fullName: 'John Doe', isAdult: true } if name='John', surname='Doe', age=25
   * ```
   *
   * @throws {Error} When a key in the map has no corresponding AST
   */
  async evalMap(map) {
    const keys = Object.keys(map);
    const result = {};
    const asts = keys.map((key) => {
      const ast = map[key];
      if (!ast) {
        throw new Error(`No AST found for key: ${key}`);
      }
      return this.eval(ast);
    });
    const vals = await Promise.all(asts);
    vals.forEach((val, idx) => {
      const key = keys[idx];
      if (key !== void 0) {
        result[key] = val;
      }
    });
    return result;
  }
  /**
   * Applies a filter expression with relative identifiers to an array of subjects.
   *
   * This method implements array filtering where each element becomes the relative context
   * for evaluating the filter expression. Elements that produce a truthy result are included
   * in the returned array. This is used for expressions like `users[.active == true]`.
   *
   * @param subject - The value to filter (converted to array if not already)
   * @param expr - Filter expression tree with relative identifiers (starting with '.')
   * @returns Promise resolving to filtered array of elements that passed the test
   *
   * @example Basic array filtering
   * ```typescript
   * const users = [
   *   { name: 'Alice', age: 25, active: true },
   *   { name: 'Bob', age: 17, active: false },
   *   { name: 'Carol', age: 30, active: true }
   * ]
   * // Filter expression: .active == true
   * const filterExpr = {
   *   type: 'BinaryExpression',
   *   operator: '==',
   *   left: { type: 'Identifier', value: 'active', relative: true },
   *   right: { type: 'Literal', value: true }
   * }
   * const result = await evaluator._filterRelative(users, filterExpr)
   * // Returns [{ name: 'Alice', age: 25, active: true }, { name: 'Carol', age: 30, active: true }]
   * ```
   *
   * @example Complex filtering with multiple conditions
   * ```typescript
   * // Filter expression: .age >= 18 && .score > 80
   * const result = await evaluator._filterRelative(students, complexFilterExpr)
   * // Returns only adult students with high scores
   * ```
   *
   * @example Non-array subject
   * ```typescript
   * const singleUser = { name: 'John', active: true }
   * // Gets converted to [singleUser] before filtering
   * const result = await evaluator._filterRelative(singleUser, filterExpr)
   * // Returns [singleUser] if filter passes, [] if it doesn't
   * ```
   *
   * @private
   */
  async _filterRelative(subject, expr) {
    const promises = [];
    let subjectArray;
    if (!Array.isArray(subject)) {
      subjectArray = subject === void 0 ? [] : [subject];
    } else {
      subjectArray = subject;
    }
    subjectArray.forEach((elem) => {
      const evalInst = new _Evaluator(this._grammar, this._context, elem);
      promises.push(evalInst.eval(expr));
    });
    const values = await Promise.all(promises);
    const results = [];
    values.forEach((value, idx) => {
      if (value) {
        results.push(subjectArray[idx]);
      }
    });
    return results;
  }
  /**
   * Applies a static filter expression to access object properties or array elements.
   *
   * This method handles bracket notation access like `obj[key]` or `arr[index]`. If the
   * filter expression evaluates to a boolean, it returns the subject for true or undefined
   * for false. For other values, it uses the result as a property key or array index.
   *
   * @param subject - The object or array to access
   * @param expr - Expression tree that evaluates to a property key, array index, or boolean
   * @returns Promise resolving to the accessed value or undefined
   *
   * @example Object property access
   * ```typescript
   * const user = { name: 'John', email: 'john@example.com' }
   * // Filter expression: "em" + "ail"
   * const keyExpr = {
   *   type: 'BinaryExpression',
   *   operator: '+',
   *   left: { type: 'Literal', value: 'em' },
   *   right: { type: 'Literal', value: 'ail' }
   * }
   * const result = await evaluator._filterStatic(user, keyExpr)
   * // Returns 'john@example.com'
   * ```
   *
   * @example Array index access
   * ```typescript
   * const items = ['apple', 'banana', 'cherry']
   * // Filter expression: 1 + 1
   * const indexExpr = {
   *   type: 'BinaryExpression',
   *   operator: '+',
   *   left: { type: 'Literal', value: 1 },
   *   right: { type: 'Literal', value: 1 }
   * }
   * const result = await evaluator._filterStatic(items, indexExpr)
   * // Returns 'cherry' (items[2])
   * ```
   *
   * @example Boolean filtering
   * ```typescript
   * const data = { value: 42 }
   * // Filter expression: true
   * const boolExpr = { type: 'Literal', value: true }
   * const result = await evaluator._filterStatic(data, boolExpr)
   * // Returns { value: 42 } (the original data)
   * ```
   *
   * @private
   */
  async _filterStatic(subject, expr) {
    const res = await this.eval(expr);
    if (typeof res === "boolean") {
      return res ? subject : void 0;
    }
    if (subject === void 0) {
      return void 0;
    }
    if (subject === null) {
      return null;
    }
    if (typeof subject === "object" || Array.isArray(subject)) {
      return subject[res];
    }
    return void 0;
  }
  // ===== Private Handler Methods =====
  // These methods handle specific AST node types during evaluation
  /**
   * Evaluates an ArrayLiteral node by evaluating each element expression.
   *
   * @param ast - ArrayLiteral node containing array of element expressions
   * @returns Promise resolving to array with evaluated element values
   *
   * @example
   * ```typescript
   * // For array literal [name, age + 1, "static"]
   * const ast = {
   *   type: 'ArrayLiteral',
   *   value: [
   *     { type: 'Identifier', value: 'name' },
   *     { type: 'BinaryExpression', operator: '+', left: {...}, right: {...} },
   *     { type: 'Literal', value: 'static' }
   *   ]
   * }
   * const result = await evaluator._handleArrayLiteral(ast)
   * // Returns ['John', 26, 'static'] if name='John' and age=25
   * ```
   */
  async _handleArrayLiteral(ast) {
    return this.evalArray(ast.value);
  }
  /**
   * Evaluates a BinaryExpression node by applying the operator to left and right operands.
   *
   * Supports two evaluation modes:
   * - `eval`: Pre-evaluates both operands and passes values to operator function
   * - `evalOnDemand`: Passes wrapped operands that can be evaluated conditionally (for && and ||)
   *
   * @param ast - BinaryExpression node with operator and left/right operands
   * @returns Promise resolving to the operation result
   *
   * @example Arithmetic operation
   * ```typescript
   * // For expression "price * quantity"
   * const ast = {
   *   type: 'BinaryExpression',
   *   operator: '*',
   *   left: { type: 'Identifier', value: 'price' },
   *   right: { type: 'Identifier', value: 'quantity' }
   * }
   * const result = await evaluator._handleBinaryExpression(ast)
   * // Returns 150 if price=15 and quantity=10
   * ```
   *
   * @example Logical operation (evalOnDemand)
   * ```typescript
   * // For expression "user && user.active"
   * // Right side only evaluated if left side is truthy
   * const result = await evaluator._handleBinaryExpression(logicalAst)
   * // Returns user.active value if user exists, otherwise false
   * ```
   *
   * @throws {Error} When operator is unknown or has no eval function
   */
  async _handleBinaryExpression(ast) {
    const grammarOp = this._grammar.elements[ast.operator];
    if (!grammarOp) {
      throw new Error(`Unknown binary operator: ${ast.operator}`);
    }
    if ("evalOnDemand" in grammarOp && grammarOp.evalOnDemand) {
      const wrap = (subAst) => ({ eval: () => this.eval(subAst) });
      return grammarOp.evalOnDemand(wrap(ast.left), wrap(ast.right));
    }
    if ("eval" in grammarOp && grammarOp.eval) {
      const [leftVal, rightVal] = await Promise.all([this.eval(ast.left), this.eval(ast.right)]);
      return grammarOp.eval(leftVal, rightVal);
    }
    throw new Error(`Binary operator ${ast.operator} has no eval function`);
  }
  /**
   * Evaluates a ConditionalExpression node (ternary operator: test ? consequent : alternate).
   *
   * First evaluates the test expression. If truthy, evaluates and returns the consequent.
   * If falsy, evaluates and returns the alternate. If consequent is missing (Elvis operator),
   * returns the test result itself.
   *
   * @param ast - ConditionalExpression node with test, consequent, and alternate
   * @returns Promise resolving to either consequent or alternate result
   *
   * @example Standard ternary
   * ```typescript
   * // For expression "age >= 18 ? 'adult' : 'minor'"
   * const ast = {
   *   type: 'ConditionalExpression',
   *   test: { type: 'BinaryExpression', operator: '>=', ... },
   *   consequent: { type: 'Literal', value: 'adult' },
   *   alternate: { type: 'Literal', value: 'minor' }
   * }
   * const result = await evaluator._handleConditionalExpression(ast)
   * // Returns 'adult' if age >= 18, 'minor' otherwise
   * ```
   *
   * @example Elvis operator (missing consequent)
   * ```typescript
   * // For expression "user.nickname ?: user.name"
   * // If nickname is truthy, return it; otherwise return name
   * const result = await evaluator._handleConditionalExpression(elvisAst)
   * // Returns nickname if it exists and is truthy, otherwise returns name
   * ```
   */
  async _handleConditionalExpression(ast) {
    const res = await this.eval(ast.test);
    if (res) {
      if (ast.consequent) {
        return this.eval(ast.consequent);
      }
      return res;
    }
    return this.eval(ast.alternate);
  }
  /**
   * Evaluates a FilterExpression node for array filtering or property access.
   *
   * Delegates to either relative filtering (for expressions like `users[.active]`) or
   * static filtering (for expressions like `user[key]` or `items[0]`).
   *
   * @param ast - FilterExpression node with subject, filter expression, and relative flag
   * @returns Promise resolving to filtered array or accessed property value
   *
   * @example Relative filtering
   * ```typescript
   * // For expression "users[.age > 21]"
   * const ast = {
   *   type: 'FilterExpression',
   *   subject: { type: 'Identifier', value: 'users' },
   *   expr: { type: 'BinaryExpression', operator: '>', ... },
   *   relative: true
   * }
   * const result = await evaluator._handleFilterExpression(ast)
   * // Returns array of users with age > 21
   * ```
   *
   * @example Static property access
   * ```typescript
   * // For expression "config['api' + 'Key']"
   * const ast = {
   *   type: 'FilterExpression',
   *   subject: { type: 'Identifier', value: 'config' },
   *   expr: { type: 'BinaryExpression', operator: '+', ... },
   *   relative: false
   * }
   * const result = await evaluator._handleFilterExpression(ast)
   * // Returns config.apiKey value
   * ```
   */
  async _handleFilterExpression(ast) {
    const subject = await this.eval(ast.subject);
    if (ast.relative) {
      return this._filterRelative(subject, ast.expr);
    }
    return this._filterStatic(subject, ast.expr);
  }
  /**
   * Evaluates an Identifier node to resolve variable or property values.
   *
   * Handles multiple scenarios:
   * - Simple identifiers: resolved from main or relative context
   * - Property access: resolves the 'from' object first, then accesses the property
   * - Array indexing: automatically uses first element if accessing property on array
   *
   * @param ast - Identifier node with value, optional 'from' expression, and relative flag
   * @returns Promise resolving to the identifier's value or undefined if not found
   *
   * @example Simple identifier
   * ```typescript
   * // For identifier "username"
   * const ast = {
   *   type: 'Identifier',
   *   value: 'username',
   *   relative: false
   * }
   * const result = await evaluator._handleIdentifier(ast)
   * // Returns context.username value
   * ```
   *
   * @example Property access
   * ```typescript
   * // For expression "user.profile.avatar"
   * const ast = {
   *   type: 'Identifier',
   *   value: 'avatar',
   *   from: {
   *     type: 'Identifier',
   *     value: 'profile',
   *     from: { type: 'Identifier', value: 'user' }
   *   }
   * }
   * const result = await evaluator._handleIdentifier(ast)
   * // Returns user.profile.avatar value
   * ```
   *
   * @example Relative identifier
   * ```typescript
   * // For relative identifier ".status" in filter context
   * const ast = {
   *   type: 'Identifier',
   *   value: 'status',
   *   relative: true
   * }
   * const result = await evaluator._handleIdentifier(ast)
   * // Returns current relative context's status property
   * ```
   *
   * @example Array property access
   * ```typescript
   * // For "users.name" where users is an array
   * // Automatically accesses users[0].name
   * const result = await evaluator._handleIdentifier(arrayPropertyAst)
   * // Returns first user's name
   * ```
   */
  async _handleIdentifier(ast) {
    if (!ast.from) {
      return ast.relative ? this._relContext[ast.value] : this._context[ast.value];
    }
    const context = await this.eval(ast.from);
    if (context === void 0) {
      return void 0;
    }
    if (context === null) {
      return null;
    }
    let targetContext = context;
    if (Array.isArray(context)) {
      targetContext = context[0];
    }
    return targetContext?.[ast.value];
  }
  /**
   * Evaluates a Literal node by returning its stored value.
   *
   * Literals represent constant values like strings, numbers, booleans, null, etc.
   * This is the simplest evaluation case - just return the pre-parsed value.
   *
   * @param ast - Literal node containing the constant value
   * @returns The literal value (string, number, boolean, null, etc.)
   *
   * @example String literal
   * ```typescript
   * const ast = { type: 'Literal', value: 'Hello World' }
   * const result = evaluator._handleLiteral(ast)
   * // Returns 'Hello World'
   * ```
   *
   * @example Number literal
   * ```typescript
   * const ast = { type: 'Literal', value: 42.5 }
   * const result = evaluator._handleLiteral(ast)
   * // Returns 42.5
   * ```
   *
   * @example Boolean literal
   * ```typescript
   * const ast = { type: 'Literal', value: true }
   * const result = evaluator._handleLiteral(ast)
   * // Returns true
   * ```
   */
  _handleLiteral(ast) {
    return ast.value;
  }
  /**
   * Evaluates an ObjectLiteral node by evaluating each property value expression.
   *
   * Creates a new object with the same property keys but with evaluated values.
   * Each property value is an expression that gets evaluated independently.
   *
   * @param ast - ObjectLiteral node containing map of property names to value expressions
   * @returns Promise resolving to object with same keys but evaluated values
   *
   * @example Simple object literal
   * ```typescript
   * // For object literal "{ name: firstName, age: currentYear - birthYear }"
   * const ast = {
   *   type: 'ObjectLiteral',
   *   value: {
   *     name: { type: 'Identifier', value: 'firstName' },
   *     age: {
   *       type: 'BinaryExpression',
   *       operator: '-',
   *       left: { type: 'Identifier', value: 'currentYear' },
   *       right: { type: 'Identifier', value: 'birthYear' }
   *     }
   *   }
   * }
   * const result = await evaluator._handleObjectLiteral(ast)
   * // Returns { name: 'John', age: 25 } if firstName='John', currentYear=2023, birthYear=1998
   * ```
   *
   * @example Nested object literal
   * ```typescript
   * // For "{ user: { id: userId, active: true }, meta: { created: now() } }"
   * const result = await evaluator._handleObjectLiteral(nestedAst)
   * // Returns fully evaluated nested object structure
   * ```
   */
  async _handleObjectLiteral(ast) {
    return this.evalMap(ast.value);
  }
  /**
   * Evaluates a FunctionCall node by calling the function with evaluated arguments.
   *
   * Looks up the function in the appropriate pool (functions or transforms), evaluates
   * all arguments, and calls the function with the results. Transforms receive the
   * subject as the first argument, followed by any additional arguments.
   *
   * @param ast - FunctionCall node with name, arguments, and pool specification
   * @returns Promise resolving to the function's return value
   *
   * @example Regular function call
   * ```typescript
   * // For function call "max(score1, score2, 100)"
   * const ast = {
   *   type: 'FunctionCall',
   *   name: 'max',
   *   pool: 'functions',
   *   args: [
   *     { type: 'Identifier', value: 'score1' },
   *     { type: 'Identifier', value: 'score2' },
   *     { type: 'Literal', value: 100 }
   *   ]
   * }
   * const result = await evaluator._handleFunctionCall(ast)
   * // Returns 100 if score1=85 and score2=92
   * ```
   *
   * @example Transform call
   * ```typescript
   * // For transform "name|upper" (transforms are also FunctionCall nodes)
   * const ast = {
   *   type: 'FunctionCall',
   *   name: 'upper',
   *   pool: 'transforms',
   *   args: [{ type: 'Identifier', value: 'name' }]
   * }
   * const result = await evaluator._handleFunctionCall(ast)
   * // Returns 'JOHN' if name='john' and upper transform converts to uppercase
   * ```
   *
   * @throws {Error} When function pool is invalid or function is not defined
   */
  async _handleFunctionCall(ast) {
    const poolName = poolNames[ast.pool];
    if (!poolName) {
      throw new Error(`Corrupt AST: Pool '${ast.pool}' not found`);
    }
    const pool = this._grammar[ast.pool];
    const func = pool[ast.name];
    if (!func) {
      throw new Error(`${poolName} ${ast.name} is not defined.`);
    }
    const args = await this.evalArray(ast.args || []);
    return func(...args);
  }
  /**
   * Evaluates a UnaryExpression node by applying the unary operator to its operand.
   *
   * Evaluates the right-side operand first, then applies the unary operator's
   * evaluation function to the result. Common unary operators include negation (!).
   *
   * @param ast - UnaryExpression node with operator and right operand
   * @returns Promise resolving to the operation result
   *
   * @example Logical negation
   * ```typescript
   * // For expression "!user.active"
   * const ast = {
   *   type: 'UnaryExpression',
   *   operator: '!',
   *   right: {
   *     type: 'Identifier',
   *     value: 'active',
   *     from: { type: 'Identifier', value: 'user' }
   *   }
   * }
   * const result = await evaluator._handleUnaryExpression(ast)
   * // Returns false if user.active is true, true if user.active is false
   * ```
   *
   * @example Numeric negation (if supported)
   * ```typescript
   * // For expression "-price"
   * const ast = {
   *   type: 'UnaryExpression',
   *   operator: '-',
   *   right: { type: 'Identifier', value: 'price' }
   * }
   * const result = await evaluator._handleUnaryExpression(ast)
   * // Returns -15.99 if price=15.99
   * ```
   *
   * @throws {Error} When operator is unknown or has no eval function
   */
  async _handleUnaryExpression(ast) {
    const right = await this.eval(ast.right);
    const grammarOp = this._grammar.elements[ast.operator];
    if (!grammarOp) {
      throw new Error(`Unknown unary operator: ${ast.operator}`);
    }
    if ("eval" in grammarOp && grammarOp.eval) {
      return grammarOp.eval(right);
    }
    throw new Error(`Unary operator ${ast.operator} has no eval function`);
  }
};

// src/Expression.ts
var Expression = class {
  /** The grammar configuration used for parsing and evaluation */
  _grammar;
  /** The original expression string provided during construction */
  _exprStr;
  /** The compiled Abstract Syntax Tree, null until compilation */
  _ast;
  /**
   * Creates a new Expression instance with the given grammar and expression string.
   * Note: The expression is not compiled until `compile()` is called explicitly
   * or implicitly during the first evaluation.
   *
   * @param grammar The grammar configuration containing operators, functions, and transforms
   * @param exprStr The Jexl expression string to be compiled and evaluated
   *
   * @example
   * ```typescript
   * const expr = new Expression(grammar, 'user.name | upper')
   * ```
   */
  constructor(grammar, exprStr) {
    this._grammar = grammar;
    this._exprStr = exprStr;
    this._ast = null;
  }
  /**
   * Forces a compilation of the expression string that this Expression object
   * was constructed with. This function can be called multiple times; useful
   * if the language elements of the associated Jexl instance change.
   * @returns this Expression instance, for convenience
   */
  compile() {
    const lexer = new Lexer(this._grammar);
    const parser = new Parser(this._grammar);
    parser.addTokens(lexer.tokenize(this._exprStr));
    this._ast = parser.complete();
    return this;
  }
  /**
   * Asynchronously evaluates the expression within an optional context.
   * @param context A mapping of variables to values, which will be
   *      made accessible to the Jexl expression when evaluating it
   * @returns resolves with the result of the evaluation.
   */
  eval(context = {}) {
    return this._eval(context);
  }
  /**
   * Asynchronously evaluates the expression and coerces the result to a string.
   * @param context A mapping of variables to values.
   * @returns A promise that resolves with the result of the evaluation as a string.
   */
  async evalAsString(context = {}) {
    const result = await this.eval(context);
    if (result === null) {
      return "null";
    }
    if (result === void 0) {
      return "undefined";
    }
    return String(result);
  }
  /**
   * Asynchronously evaluates the expression and coerces the result to a number.
   * `null` and `undefined` are coerced to `NaN`, as you suggested.
   * @param context A mapping of variables to values.
   * @returns A promise that resolves with the result of the evaluation as a number.
   */
  async evalAsNumber(context = {}) {
    const result = await this.eval(context);
    if (result === null || result === void 0) {
      return NaN;
    }
    return Number(result);
  }
  /**
   * Asynchronously evaluates the expression and coerces the result to a boolean.
   * Uses standard JavaScript truthiness.
   * @param context A mapping of variables to values.
   * @returns A promise that resolves with the result of the evaluation as a boolean.
   */
  async evalAsBoolean(context = {}) {
    const result = await this.eval(context);
    return !!result;
  }
  /**
   * Asynchronously evaluates the expression and ensures the result is an array.
   * - If the result is an array, it's returned as is.
   * - If the result is `null` or `undefined`, an empty array `[]` is returned.
   * - Otherwise, the result is wrapped in an array.
   *
   * The element type of the returned array is inferred from the Expression's
   * generic type `R`. If `R` is `T[]`, elements are of type `T`. If `R` is `T`,
   * elements are also of type `T`.
   *
   * @param context A mapping of variables to values.
   * @returns A promise that resolves with the result as an array.
   */
  async evalAsArray(context = {}) {
    const result = await this.eval(context);
    if (result === null || result === void 0) {
      return [];
    }
    if (Array.isArray(result)) {
      return result;
    }
    return [result];
  }
  /**
   * Asynchronously evaluates the expression and validates it against a list of allowed values.
   *
   * @param context A mapping of variables to values.
   * @param allowedValues An array of allowed values for the result.
   * @returns A promise that resolves with the result if it's in the `allowedValues` list, otherwise `undefined`.
   */
  async evalAsEnum(context = {}, allowedValues) {
    const result = await this.eval(context);
    if (allowedValues.includes(result)) {
      return result;
    }
    return void 0;
  }
  /**
   * Asynchronously evaluates the expression, returning a default value if the result is `null` or `undefined`.
   * This is useful for providing defaults for optional paths without relying on the `||` operator,
   * which would also override falsy values like `0`, `false`, or `""`.
   * @template T The expected type of the result.
   * @param context A mapping of variables to values.
   * @param defaultValue The value to return if the expression result is `null` or `undefined`.
   * @returns A promise that resolves with the expression's result or the default value.
   */
  async evalWithDefault(context = {}, defaultValue) {
    const result = await this.eval(context);
    if (result === null || result === void 0) {
      return defaultValue;
    }
    return result;
  }
  /**
   * Internal evaluation method that handles the actual evaluation logic.
   * @param context The evaluation context
   * @returns Promise that resolves to the evaluation result
   */
  async _eval(context) {
    const ast = this._getAst();
    if (!ast) {
      throw new Error("No AST available for evaluation. Expression may not be compiled.");
    }
    const evaluator = new Evaluator(
      this._grammar,
      context,
      context
      // Use the same context as relative context
    );
    return evaluator.eval(ast);
  }
  /**
   * Gets the compiled AST, compiling if necessary.
   * @returns The compiled AST
   * @throws {Error} if compilation fails
   */
  _getAst() {
    if (!this._ast) {
      this.compile();
    }
    return this._ast;
  }
};

// src/grammar.ts
var getGrammar = () => ({
  /**
   * A map of all expression elements to their properties. Note that changes
   * here may require changes in the Lexer or Parser.
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
      eval: function(left, right) {
        if (arguments.length === 1) {
          return +left;
        }
        return left + right;
      }
    },
    "-": {
      type: "binaryOp",
      precedence: 30,
      eval: function(left, right) {
        if (arguments.length === 1) {
          return -left;
        }
        return left - right;
      }
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
      precedence: 5,
      evalOnDemand: (left, right) => {
        return left.eval().then((leftVal) => {
          if (leftVal) return leftVal;
          return right.eval();
        });
      }
    },
    "in": {
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
   * takes zero ore more arguments:
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
   * takes one ore more arguments:
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

// src/Jexl.ts
var Jexl = class {
  /**
   * The grammar used by this Jexl instance.
   */
  grammar;
  constructor() {
    this.expr = this.expr.bind(this);
    this.grammar = getGrammar();
  }
  /**
   * Adds a custom binary operator to Jexl at the specified precedence level.
   * Binary operators work between two operands (left and right values).
   *
   * The precedence determines the order of operations - higher precedence operators
   * are evaluated first. For reference, multiplication (*) has higher precedence
   * than addition (+), so `2 + 3 * 4` evaluates as `2 + (3 * 4) = 14`.
   *
   * ## Precedence Guidelines
   * - **Arithmetic**: `*` (60), `/` (60), `%` (60), `+` (40), `-` (40)
   * - **Comparison**: `<` (30), `>` (30), `<=` (30), `>=` (30), `==` (20), `!=` (20)
   * - **Logical**: `&&` (10), `||` (5)
   *
   * @param operator The operator string (e.g., '**', '%%', '<>')
   * @param precedence The operator's precedence (higher = evaluated first)
   * @param fn Function to calculate the result, receives (left, right) operands
   * @param manualEval If true, operands are wrapped with eval() for conditional evaluation
   *
   * @example
   * ```typescript
   * // Add exponentiation operator
   * jexl.addBinaryOp('**', 70, (left: number, right: number) => Math.pow(left, right))
   * await jexl.eval('2 ** 3') // 8
   *
   * // Add string concatenation with custom operator
   * jexl.addBinaryOp('~', 45, (left: string, right: string) => left + right)
   * await jexl.eval('"Hello" ~ " World"') // "Hello World"
   *
   * // Manual evaluation for short-circuiting (like && operator)
   * jexl.addBinaryOp('??', 8, async (left, right) => {
   *   const leftVal = await left.eval()
   *   return leftVal != null ? leftVal : await right.eval()
   * }, true)
   * await jexl.eval('null ?? "default"') // "default"
   * ```
   */
  addBinaryOp(operator, precedence, fn, manualEval) {
    const element = {
      type: "binaryOp",
      precedence
    };
    if (manualEval) {
      element.evalOnDemand = fn;
    } else {
      element.eval = fn;
    }
    this._addGrammarElement(operator, element);
  }
  /**
   * Adds or replaces a custom function that can be called within Jexl expressions.
   * Functions can accept multiple arguments and perform complex operations.
   *
   * Unlike transforms (which operate on piped values), functions are called explicitly
   * with parentheses and can be used anywhere in an expression.
   *
   * @param name The function name as it will appear in expressions
   * @param fn The JavaScript function to execute, receives all expression arguments
   *
   * @example
   * ```typescript
   * // Math functions
   * jexl.addFunction('max', (...args: number[]) => Math.max(...args))
   * jexl.addFunction('min', (...args: number[]) => Math.min(...args))
   * await jexl.eval('max(1, 5, 3)') // 5
   *
   * // String utilities
   * jexl.addFunction('concat', (...strings: string[]) => strings.join(''))
   * await jexl.eval('concat("Hello", " ", "World")') // "Hello World"
   *
   * // Array operations
   * jexl.addFunction('sum', (arr: number[]) => arr.reduce((a, b) => a + b, 0))
   * await jexl.eval('sum([1, 2, 3, 4])') // 10
   *
   * // Complex logic with context access
   * jexl.addFunction('formatName', (first: string, last: string) => {
   *   return `${last}, ${first}`
   * })
   * await jexl.eval('formatName(user.firstName, user.lastName)', {
   *   user: { firstName: 'John', lastName: 'Doe' }
   * }) // "Doe, John"
   * ```
   */
  addFunction(name, fn) {
    this.grammar.functions[name] = fn;
  }
  /**
   * Convenience method for adding multiple functions at once.
   * Equivalent to calling `addFunction()` for each key-value pair in the map.
   *
   * @param map Object mapping function names to their implementations
   *
   * @example
   * ```typescript
   * jexl.addFunctions({
   *   // Math utilities
   *   square: (n: number) => n * n,
   *   cube: (n: number) => n * n * n,
   *
   *   // String utilities
   *   reverse: (str: string) => str.split('').reverse().join(''),
   *   titleCase: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
   *
   *   // Array utilities
   *   first: (arr: unknown[]) => arr[0],
   *   last: (arr: unknown[]) => arr[arr.length - 1],
   *   length: (arr: unknown[]) => arr.length
   * })
   *
   * // Usage examples
   * await jexl.eval('square(5)') // 25
   * await jexl.eval('titleCase("hello world")') // "Hello world"
   * await jexl.eval('first([1, 2, 3])') // 1
   * ```
   */
  addFunctions(map) {
    for (const key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        const fn = map[key];
        if (fn) {
          this.grammar.functions[key] = fn;
        }
      }
    }
  }
  /**
   * Adds a custom unary operator to Jexl. Unary operators work on a single operand
   * and are currently only supported as prefix operators (before the value).
   *
   * All unary operators have infinite weight, meaning they are evaluated before
   * any binary operators in the expression.
   *
   * @param operator The operator string (e.g., '!', '~', '++')
   * @param fn Function to calculate the result, receives the operand value
   *
   * @example
   * ```typescript
   * // Add bitwise NOT operator
   * jexl.addUnaryOp('~', (val: number) => ~val)
   * await jexl.eval('~5') // -6
   *
   * // Add absolute value operator
   * jexl.addUnaryOp('abs', (val: number) => Math.abs(val))
   * await jexl.eval('abs(-42)') // 42
   *
   * // Add string length operator
   * jexl.addUnaryOp('#', (val: string) => val.length)
   * await jexl.eval('#"hello"') // 5
   *
   * // Works with expressions
   * await jexl.eval('~(3 + 2)') // ~5 = -6
   * await jexl.eval('#user.name', { user: { name: 'John' } }) // 4
   * ```
   */
  addUnaryOp(operator, fn) {
    const element = {
      type: "unaryOp",
      weight: Infinity,
      eval: fn
    };
    this._addGrammarElement(operator, element);
  }
  /**
   * Adds or replaces a transform function in this Jexl instance.
   * Transforms are applied using the pipe operator (|) and operate on the
   * value to their left, optionally accepting additional arguments.
   *
   * Transforms are ideal for data processing pipelines where you want to
   * chain multiple operations together.
   *
   * @param name The transform name as it will appear after the pipe operator
   * @param fn Function that receives the piped value as first argument, plus any additional args
   *
   * @example
   * ```typescript
   * // Simple value transformation
   * jexl.addTransform('double', (val: number) => val * 2)
   * await jexl.eval('5 | double') // 10
   *
   * // Transform with arguments
   * jexl.addTransform('multiply', (val: number, factor: number) => val * factor)
   * await jexl.eval('5 | multiply(3)') // 15
   *
   * // String transformations
   * jexl.addTransform('truncate', (str: string, length: number) =>
   *   str.length > length ? str.slice(0, length) + '...' : str
   * )
   * await jexl.eval('"Hello World" | truncate(5)') // "Hello..."
   *
   * // Array transformations
   * jexl.addTransform('sum', (arr: number[]) => arr.reduce((a, b) => a + b, 0))
   * await jexl.eval('[1, 2, 3, 4] | sum') // 10
   *
   * // Chaining transforms
   * jexl.addTransform('sort', (arr: number[]) => [...arr].sort((a, b) => a - b))
   * await jexl.eval('[3, 1, 4, 2] | sort | sum') // 10
   * ```
   */
  addTransform(name, fn) {
    this.grammar.transforms[name] = fn;
  }
  /**
   * Convenience method for adding multiple transforms at once.
   * Equivalent to calling `addTransform()` for each key-value pair in the map.
   *
   * @param map Object mapping transform names to their implementations
   *
   * @example
   * ```typescript
   * jexl.addTransforms({
   *   // String transforms
   *   upper: (str: string) => str.toUpperCase(),
   *   lower: (str: string) => str.toLowerCase(),
   *   trim: (str: string) => str.trim(),
   *
   *   // Number transforms
   *   abs: (num: number) => Math.abs(num),
   *   round: (num: number, places = 0) => Number(num.toFixed(places)),
   *
   *   // Array transforms
   *   reverse: (arr: unknown[]) => [...arr].reverse(),
   *   unique: (arr: unknown[]) => [...new Set(arr)]
   * })
   *
   * // Usage examples
   * await jexl.eval('"  Hello World  " | trim | upper') // "HELLO WORLD"
   * await jexl.eval('3.14159 | round(2)') // 3.14
   * await jexl.eval('[1, 2, 2, 3] | unique') // [1, 2, 3]
   * ```
   */
  addTransforms(map) {
    for (const key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        const fn = map[key];
        if (fn) {
          this.grammar.transforms[key] = fn;
        }
      }
    }
  }
  /**
   * Creates an Expression object from the given Jexl expression string and
   * immediately compiles it into an Abstract Syntax Tree (AST).
   *
   * Compilation parses the expression once, creating an optimized representation
   * that can be evaluated multiple times with different contexts without
   * re-parsing the original string.
   *
   * @param expression The Jexl expression string to compile
   * @returns A compiled Expression object ready for evaluation
   *
   * @example
   * ```typescript
   * // Compile an expression for reuse
   * const compiled = jexl.compile('user.orders | length')
   *
   * // Evaluate with different contexts
   * await compiled.eval({ user: { orders: [1, 2, 3] } }) // 3
   * await compiled.eval({ user: { orders: [1, 2] } })    // 2
   * await compiled.eval({ user: { orders: [] } })        // 0
   *
   * // Complex expressions benefit most from compilation
   * const complexExpr = jexl.compile(
   *   'items[price > 100] | map("name") | sort | join(", ")'
   * )
   *
   * // Use with different datasets
   * const result1 = await complexExpr.eval({ items: expensiveItems })
   * const result2 = await complexExpr.eval({ items: luxuryItems })
   * ```
   */
  compile(expression) {
    const exprObj = this.createExpression(expression);
    return exprObj.compile();
  }
  /**
   * Creates an Expression object from a Jexl expression string without compiling it.
   * The expression will be compiled automatically when first evaluated.
   *
   * Use this method when you want to create an expression object but defer
   * compilation until evaluation time, or when you need to access the raw
   * expression string before compilation.
   *
   * @param expression The Jexl expression string to wrap
   * @returns An Expression object (not yet compiled)
   *
   * @example
   * ```typescript
   * // Create expression without immediate compilation
   * const expr = jexl.createExpression('user.name | upper')
   *
   * // Compilation happens automatically on first eval
   * await expr.eval({ user: { name: 'john' } }) // 'JOHN'
   *
   * // Or compile explicitly when ready
   * expr.compile()
   * await expr.eval({ user: { name: 'jane' } }) // 'JANE'
   *
   * // Useful for conditional compilation
   * const expressions = [
   *   jexl.createExpression('simple'),
   *   jexl.createExpression('complex | operation')
   * ]
   * // Compile only the ones you need
   * expressions[1].compile()
   * ```
   */
  createExpression(expression) {
    return new Expression(this.grammar, expression);
  }
  /**
   * Retrieves a previously registered expression function by name.
   * Useful for introspection, testing, or calling functions programmatically.
   *
   * @param name The name of the expression function
   * @returns The function implementation
   * @throws {Error} if the function is not found
   *
   * @example
   * ```typescript
   * // Register a function
   * jexl.addFunction('max', (...args: number[]) => Math.max(...args))
   *
   * // Retrieve and use it directly
   * const maxFn = jexl.getFunction('max')
   * maxFn(1, 5, 3) // 5
   *
   * // Check if function exists before using
   * try {
   *   const myFn = jexl.getFunction('customFunction')
   *   // Function exists, safe to use
   * } catch (error) {
   *   // Function doesn't exist, handle gracefully
   *   console.log('Function not found')
   * }
   * ```
   */
  getFunction(name) {
    const fn = this.grammar.functions[name];
    if (!fn) {
      throw new Error(`Function '${name}' is not defined`);
    }
    return fn;
  }
  /**
   * Retrieves a previously registered transform function by name.
   * Useful for introspection, testing, or calling transforms programmatically.
   *
   * @param name The name of the transform function
   * @returns The transform function implementation
   * @throws {Error} if the transform is not found
   *
   * @example
   * ```typescript
   * // Register a transform
   * jexl.addTransform('double', (val: number) => val * 2)
   *
   * // Retrieve and use it directly
   * const doubleFn = jexl.getTransform('double')
   * doubleFn(5) // 10
   *
   * // Use for programmatic transformation
   * const upperFn = jexl.getTransform('upper')
   * const names = ['john', 'jane', 'bob']
   * const upperNames = names.map(upperFn) // ['JOHN', 'JANE', 'BOB']
   *
   * // Conditional transform application
   * try {
   *   const customTransform = jexl.getTransform('customTransform')
   *   result = customTransform(value)
   * } catch (error) {
   *   result = value // fallback if transform doesn't exist
   * }
   * ```
   */
  getTransform(name) {
    const fn = this.grammar.transforms[name];
    if (!fn) {
      throw new Error(`Transform '${name}' is not defined`);
    }
    return fn;
  }
  /**
   * Evaluates a Jexl expression string with optional context data.
   * This is a convenience method that creates and evaluates an expression in one call.
   *
   * For repeated evaluations of the same expression, consider using `compile()`
   * for better performance as it avoids re-parsing the expression string.
   *
   * @param expression The Jexl expression string to evaluate
   * @param context Variables and values accessible within the expression
   * @returns Promise resolving to the evaluation result
   *
   * @example
   * ```typescript
   * // Simple evaluation
   * await jexl.eval('2 + 3') // 5
   *
   * // With context data
   * await jexl.eval('user.name', {
   *   user: { name: 'Alice', age: 30 }
   * }) // 'Alice'
   *
   * // Complex expressions with transforms
   * await jexl.eval('users | map("name") | join(", ")', {
   *   users: [
   *     { name: 'Alice', age: 30 },
   *     { name: 'Bob', age: 25 }
   *   ]
   * }) // 'Alice, Bob'
   *
   * // Conditional logic
   * await jexl.eval('age >= 18 ? "adult" : "minor"', { age: 20 }) // 'adult'
   *
   * // Array filtering and processing
   * await jexl.eval('products[price < 100] | length', {
   *   products: [
   *     { name: 'Book', price: 15 },
   *     { name: 'Phone', price: 300 },
   *     { name: 'Pen', price: 2 }
   *   ]
   * }) // 2
   * ```
   */
  eval(expression, context = {}) {
    const exprObj = this.createExpression(expression);
    return exprObj.eval(context);
  }
  /**
   * Evaluates a Jexl expression and coerces the result to a string.
   * @param expression The Jexl expression string to evaluate.
   * @param context Optional context object.
   * @returns A promise that resolves to the string result.
   */
  evalAsString(expression, context = {}) {
    const exprObj = this.createExpression(expression);
    return exprObj.evalAsString(context);
  }
  /**
   * Evaluates a Jexl expression and coerces the result to a number.
   * `null` and `undefined` results are coerced to `NaN`.
   * @param expression The Jexl expression string to evaluate.
   * @param context Optional context object.
   * @returns A promise that resolves to the number result.
   */
  evalAsNumber(expression, context = {}) {
    const exprObj = this.createExpression(expression);
    return exprObj.evalAsNumber(context);
  }
  /**
   * Evaluates a Jexl expression and coerces the result to a boolean.
   * Uses standard JavaScript truthiness rules.
   * @param expression The Jexl expression string to evaluate.
   * @param context Optional context object.
   * @returns A promise that resolves to the boolean result.
   */
  evalAsBoolean(expression, context = {}) {
    const exprObj = this.createExpression(expression);
    return exprObj.evalAsBoolean(context);
  }
  /**
   * Evaluates a Jexl expression and ensures the result is an array.
   * - If the result is an array, it's returned as is.
   * - If the result is `null` or `undefined`, an empty array `[]` is returned.
   * - Otherwise, the result is wrapped in an array.
   * @template T The expected type of elements in the array.
   * @param expression The Jexl expression string to evaluate.
   * @param context Optional context object.
   * @returns A promise that resolves with the result as an array.
   */
  evalAsArray(expression, context = {}) {
    const exprObj = this.createExpression(expression);
    return exprObj.evalAsArray(context);
  }
  /**
   * Evaluates a Jexl expression and validates it against a list of allowed values.
   * @template T The type of the enum values.
   * @param expression The Jexl expression string to evaluate.
   * @param context A mapping of variables to values.
   * @param allowedValues An array of allowed values for the result.
   * @returns A promise that resolves with the result if it's in the `allowedValues` list, otherwise `undefined`.
   */
  evalAsEnum(expression, context = {}, allowedValues) {
    const exprObj = this.createExpression(expression);
    return exprObj.evalAsEnum(context, allowedValues);
  }
  /**
   * Evaluates a Jexl expression, returning a default value if the result is `null` or `undefined`.
   * This is useful for providing defaults for optional paths without relying on the `||` operator,
   * which would also override falsy values like `0`, `false`, or `""`.
   * @template T The expected type of the result.
   * @param expression The Jexl expression string to evaluate.
   * @param context A mapping of variables to values.
   * @param defaultValue The value to return if the expression result is `null` or `undefined`.
   * @returns A promise that resolves with the expression's result or the default value.
   */
  evalWithDefault(expression, context = {}, defaultValue) {
    const exprObj = this.createExpression(expression);
    return exprObj.evalWithDefault(context, defaultValue);
  }
  /**
   * Template literal function for creating Jexl expressions with embedded JavaScript values.
   * Allows you to interpolate variables directly into expression strings using template syntax.
   *
   * The interpolated values are converted to strings and embedded directly into the expression,
   * so be careful with user input to avoid injection issues.
   *
   * @param strings The template string parts
   * @param args The interpolated values
   * @returns An Expression object ready for evaluation
   *
   * @example
   * ```typescript
   * // Basic interpolation
   * const threshold = 100
   * const expr = jexl.expr`price > ${threshold}`
   * await expr.eval({ price: 150 }) // true
   *
   * // Multiple interpolations
   * const field = 'name'
   * const value = 'John'
   * const filterExpr = jexl.expr`users[${field} == "${value}"]`
   * await filterExpr.eval({
   *   users: [
   *     { name: 'John', age: 30 },
   *     { name: 'Jane', age: 25 }
   *   ]
   * }) // [{ name: 'John', age: 30 }]
   *
   * // Dynamic property access
   * const property = 'email'
   * const userExpr = jexl.expr`user.${property}`
   * await userExpr.eval({
   *   user: { name: 'Alice', email: 'alice@example.com' }
   * }) // 'alice@example.com'
   *
   * // Building expressions programmatically
   * const operations = ['upper', 'trim']
   * const transformChain = operations.join(' | ')
   * const dynamicExpr = jexl.expr`input | ${transformChain}`
   * await dynamicExpr.eval({ input: '  hello world  ' }) // 'HELLO WORLD'
   * ```
   */
  expr(strings, ...args) {
    const exprStr = strings.reduce((acc, str, idx) => {
      const arg = idx < args.length ? args[idx] : "";
      acc += str + arg;
      return acc;
    }, "");
    return this.createExpression(exprStr);
  }
  /**
   * Removes a binary or unary operator from the Jexl grammar.
   * This permanently removes the operator from this Jexl instance, making it
   * unavailable for use in future expressions.
   *
   * @param operator The operator string to remove (e.g., '+', '&&', '!')
   *
   * @example
   * ```typescript
   * // Remove the modulo operator
   * jexl.removeOp('%')
   *
   * // This will now throw an error
   * try {
   *   await jexl.eval('10 % 3')
   * } catch (error) {
   *   console.log('Modulo operator not available')
   * }
   *
   * // Remove multiple operators
   * jexl.removeOp('+')
   * jexl.removeOp('-')
   * jexl.removeOp('!')
   *
   * // Create a restricted expression environment
   * const restrictedJexl = new Jexl()
   * restrictedJexl.removeOp('*') // No multiplication
   * restrictedJexl.removeOp('/') // No division
   * // Only allow safe operations
   * ```
   */
  removeOp(operator) {
    if (Object.prototype.hasOwnProperty.call(this.grammar.elements, operator) && (this.grammar.elements[operator].type === "binaryOp" || this.grammar.elements[operator].type === "unaryOp")) {
      delete this.grammar.elements[operator];
    }
  }
  /**
   * Adds an element to the grammar map used by this Jexl instance.
   * @param str The key string to be added
   * @param obj A map of configuration options for this grammar element
   * @private
   */
  _addGrammarElement(str, obj) {
    this.grammar.elements[str] = obj;
  }
};
export {
  Jexl,
  ValidationSeverity,
  Validator
};

const _ExportContents = {
	Jexl: Jexl,
	ValidationSeverity: ValidationSeverity,
	Validator: Validator
}

export default _ExportContents;