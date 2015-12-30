var Utility = (function () {
    function Utility(debugMode) {
        if (debugMode === void 0) { debugMode = true; }
        this.debugMode = debugMode;
    }
    Utility.prototype.debug = function () {
        if (this.debugMode)
            console.log.apply(console, Array.prototype.slice.call(arguments));
    };
    return Utility;
})();
//# sourceMappingURL=Utilities.js.map