var Rule = (function () {
    function Rule(name, type, verifier, introduction, elimination) {
        this.name = name;
        this.type = type;
        this.verifier = verifier;
        this.introduction = introduction;
        this.elimination = elimination;
    }
    Object.defineProperty(Rule.prototype, "Name", {
        get: function () { return this.name; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rule.prototype, "Type", {
        get: function () { return this.type; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rule.prototype, "SimpleVerifier", {
        get: function () { return this.verifier || null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rule.prototype, "IntroVerifier", {
        get: function () { return this.introduction || null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rule.prototype, "ElimVerifier", {
        get: function () { return this.elimination || null; },
        enumerable: true,
        configurable: true
    });
    return Rule;
})();
//# sourceMappingURL=Rule.js.map