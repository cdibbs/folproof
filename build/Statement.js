var Statement = (function () {
    function Statement(sentenceAST, justificationAST, scope, loc, isFirst, isLast) {
        this.sentenceAST = sentenceAST;
        this.justificationAST = justificationAST;
        this.scope = scope;
        this.loc = loc;
        this.isFirst = isFirst;
        this.isLast = isLast;
    }
    Object.defineProperty(Statement.prototype, "isFirstStmt", {
        get: function () { return this.isFirst; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statement.prototype, "isLastStmt", {
        get: function () { return this.isLast; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statement.prototype, "Sentence", {
        get: function () { return this.sentenceAST; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statement.prototype, "Scope", {
        get: function () { return this.scope; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statement.prototype, "Justification", {
        get: function () { return this.justificationAST; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Statement.prototype, "Meta", {
        get: function () { return this.loc; },
        enumerable: true,
        configurable: true
    });
    return Statement;
})();
//# sourceMappingURL=Statement.js.map