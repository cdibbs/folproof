///<reference path='FOLRulebookFactory.ts' />
///<reference path='Utilities.ts' />
///<reference path='Statement.ts' />;
///<reference path='VerificationResult.ts' />
///<reference path='Proof.ts' />
var Verifier = (function () {
    function Verifier(debugMode) {
        if (debugMode === void 0) { debugMode = false; }
        this.debugMode = debugMode;
        this.util = new Utility(debugMode);
        this.log = this.util.debug;
        this.rulebookFactory = new FOLRulebookFactory(this.log);
    }
    Verifier.prototype.VerifyFromAST = function (ast) {
        var proof = this.Preprocess(ast);
        return this.Verify(proof);
    };
    Verifier.prototype.Verify = function (proof) {
        this.rules = this.rulebookFactory.BuildRulebook();
        var result = new VerificationResult(true, "Proof is valid.");
        for (var i = 0; i < proof.Steps.length; i++) {
            result = this.ValidateStatement(result, proof, i);
            if (!result.Valid) {
                break;
            }
        }
        return result;
    };
    Verifier.prototype.ValidateStatement = function (currResult, proof, step) {
        var stmt = proof.Steps[step];
        if (stmt[0] === 'error') {
            currResult.Valid = false;
            currResult.Message = "Proof invalid due to syntax errors.";
            currResult.ErrorStep = step + 1;
            return currResult;
        }
        var why = stmt.Justification;
        var newv = null;
        if (why[0].split('.').length == 2)
            newv = why[0].split('.')[1];
        var validator = this.LookupValidator(why);
        if (typeof validator === 'function') {
            var part = why[2], lines = why[3];
            var subst = null;
            if (newv && why[4])
                subst = [newv, why[4]];
            var isValid = validator(proof, step, part, lines, subst);
            if (isValid === true) {
                currResult.Valid = true;
            }
            else {
                currResult.Valid = false;
                currResult.Message = isValid;
                currResult.ErrorStep = step + 1;
                currResult.ErrorMeta = stmt.Meta();
            }
            return currResult;
        }
        else if (typeof validator === "string") {
            currResult.Valid = false;
            currResult.Message = validator;
            currResult.ErrorStep = step + 1;
            currResult.ErrorMeta = stmt.Meta();
        }
        currResult.Valid = false;
        return currResult;
    };
    Verifier.prototype.LookupValidator = function (why) {
        var name = why[0].toLowerCase();
        if (name.split('.').length == 2)
            name = name.split('.')[0] + ".";
        var rule = this.rules[name];
        if (!rule)
            return "Cannot find rule: " + name;
        if (rule.Type === "simple" || rule.Type === "derived") {
            var fn = rule.SimpleVerifier;
            if (!fn)
                throw new Error("Not implemented for " + name);
            return fn.exec;
        }
        if (why[1]) {
            var elimOrIntro = why[1].toLowerCase();
            if ("introduction".indexOf(elimOrIntro) === 0) {
                var fn = rule.IntroVerifier;
                if (!fn)
                    throw new Error("Not implemented for " + name);
                return fn.exec;
            }
            else if ("elimination".indexOf(elimOrIntro) === 0) {
                var fn = rule.ElimVerifier;
                if (!fn)
                    throw new Error("Not implemented for " + name);
                return fn.exec;
            }
            return "Cannot determine elim/intro rule type from " + elimOrIntro;
        }
        return "Unrecognized rule: " + why[0] + " " + (why[1] ? why[1] : "") + (why[2] ? why[2] : "") + " " + (why[3] ? why[3] : "");
    };
    Verifier.prototype.Preprocess = function (ast) {
        var proof = new Proof();
        this.PreprocessBox(proof, ast, 0, []);
        return proof;
    };
    Verifier.prototype.PreprocessBox = function (proof, ast, step, scope) {
        for (var i = 0; i < ast.length; i++) {
            if (ast[i][0] === 'rule') {
                proof.steps[step] = new Statement(ast[i][1], ast[i][2], scope, ast[i][3], i == 0, i == ast.length - 1);
                step = step + 1;
            }
            else if (ast[i][0] === 'folbox') {
                var newScope = scope.slice(0);
                newScope.push(ast[i][2][1]);
                step = this.PreprocessBox(proof, ast[i][1], step, newScope);
            }
            else if (ast[i][0] === 'box') {
                var newScope = scope.slice(0);
                newScope.push(null);
                step = this.PreprocessBox(proof, ast[i][1], step, newScope);
            }
            else if (ast[i][0] === 'error') {
                proof.steps[step] = ast[i];
            }
        }
        return step;
    };
    return Verifier;
})();
exports.Verifier = Verifier;
/*module.exports = {
    Verifier : Verifier
};
*/
