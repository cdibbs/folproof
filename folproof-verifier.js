(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.folproof = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var Rule = (function () {
    function Rule(name, type, verifier, introduction, elimination) {
        this.name = name;
        this.type = type;
        this.verifier = verifier;
        this.introduction = introduction;
        this.elimination = elimination;
    }
    Object.defineProperty(Rule.prototype, "Name", {
        // { name : name,
        //   type : ["simple", "derived", "normal"],
        //   verifier : new Verifier(parseFormat, function(proof, step) {}),
        //   introduction : new Verifier(parseFormat, function(proof, step, part, steps, subst) {}),
        //   elimination : new Verifier(parseFormat, function(proof, step, part, steps, subst) {})
        // }
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
// format = { hasPart : (true/false), stepRefs : ("num" | "range")*, subst : (true/false) };
var ReasonFormat = (function () {
    function ReasonFormat() {
        this.HasPart = false; // (true/false)
        this.Substitution = false;
    }
    return ReasonFormat;
})();
/// <reference path="ReasonFormat.ts" />
/// <reference path="Utilities.ts" />
var Justifier = (function () {
    function Justifier(reasonFormat, callback, debug) {
        if (debug === void 0) { debug = function () { }; }
        this.reasonFormat = reasonFormat;
        this.callback = callback;
        this.debug = debug;
    }
    Justifier.prototype.exec = function (proof, step, part, steps, subst) {
        this.debug(step, part, steps, subst);
        var checked = this.checkParams(step, part, steps, subst);
        if (typeof checked === "string")
            return checked;
        return this.callback(proof, step, checked[0], checked[1], checked[2]);
    };
    Justifier.prototype.checkParams = function (curStep, part, steps, subst) {
        if (this.reasonFormat === null) {
            if (part != null)
                return "Step part (e.g., 2 in 'and e2') not applicable, in this context.";
            if (steps != null)
                return "Step references not applicable.";
            if (subst != null)
                return "Substitutions not applicable.";
            return [];
        }
        var partNum = null, refNums = [], w = null;
        if (this.reasonFormat.HasPart) {
            partNum = parseInt(part);
            if (!(partNum == 1 || partNum == 2))
                return "Part number must be 1 or 2";
        }
        else if (part != null)
            return "Step part (e.g., 2 in 'and e2') not applicable, in this context.";
        if (this.reasonFormat.StepRefs) {
            if (steps.length != this.reasonFormat.StepRefs.length) {
                var f = this.reasonFormat.StepRefs
                    .map(function (e) { return e == "num" ? "n" : "n-m"; });
                return "Step reference mismatch; required format: " + f.join(", ") + ".";
            }
            for (var i = 0; i < steps.length; i++) {
                if (this.reasonFormat.StepRefs[i] == "num") {
                    var n = parseInt(steps[i]) - 1;
                    if (!(n >= 0 && n < curStep))
                        return "Step reference #" + (i + 1) + " must be 1 <= step < current.";
                    refNums.push(n);
                }
                else {
                    var ab = steps[i].split("-");
                    if (ab.length != 2)
                        return "Step reference # " + (i + 1) + " must be range, a-b, with a <= b.";
                    ab = [parseInt(ab[0]) - 1, parseInt(ab[1]) - 1];
                    if (ab[0] > ab[1] || Math.max(ab[0], ab[1]) >= curStep)
                        return "Step reference # " + (i + 1) + " must be range, a-b, with a <= b.";
                    refNums.push(ab);
                }
            }
        }
        else {
            if (steps != null)
                return "Step references not applicable, here.";
        }
        if (this.reasonFormat.Substitution) {
            if (!subst)
                return "Substitution specification required (e.g., A.x/x0 intro n-m)";
            w = subst.map(function (e) { return e.match("^[A-Za-z_][A-Za-z_0-9]*$"); });
            var allValidIds = w.reduce(function (a, e) { return a && e && e.length == 1 && e[0]; });
            if (w.length != 2 || !allValidIds)
                return "Substitution format must match (e.g., A.x/x0 intro n-m.)";
            w = w.map(function (e) { return e[0]; });
        }
        else {
            if (subst)
                return "Substitution unexpected.";
        }
        return [partNum, refNums, w];
    };
    return Justifier;
})();
///<reference path="Rule.ts" />
/// <reference path='Utilities.ts' />
/// <reference path='Rule.ts' />
/// <reference path='Justifier.ts' />
/// <reference path='IRulebookFactory.ts' />
var FOLRulebookFactory = (function () {
    function FOLRulebookFactory(debug) {
        var _this = this;
        if (debug === void 0) { debug = function () { }; }
        this.debug = debug;
        this.rules = {
            "premise": {
                Name: "Premise",
                Type: "simple",
                SimpleVerifier: new Justifier(null, function (proof, step) { return true; })
            },
            "assumption": {
                Name: "Assumption",
                Type: "simple",
                SimpleVerifier: new Justifier(null, function (proof, step) {
                    if (proof.steps[step].isFirstStmt())
                        return true;
                    return "Assumptions can only be made at the start of an assumption box.";
                })
            },
            "lem": {
                Name: "LEM",
                Type: "derived",
                SimpleVerifier: new Justifier(null, function (proof, step) {
                    var s = proof.steps[step].getSentence();
                    if (s[0] !== "or")
                        return "LEM: must be phi or not phi.";
                    var left = s[1], right = s[2];
                    if (right[0] !== "not" || !_this.semanticEq(left, right[1]))
                        return "LEM: right side must be negation of left.";
                    return true;
                })
            },
            "copy": {
                Name: "COPY",
                Type: "derived",
                SimpleVerifier: new Justifier({ StepRefs: ["num"] }, function (proof, step, part, steps) {
                    var curStep = proof.steps[step].getSentence();
                    var refStep = proof.steps[steps[0]].getSentence();
                    if (!this.semanticEq(curStep, refStep))
                        return "Copy: Current step is not semantically equal to the referenced step.";
                    return true;
                })
            },
            "mt": {
                Name: "MT",
                Type: "derived",
                SimpleVerifier: new Justifier({ StepRefs: ["num", "num"] }, function (proof, step, part, steps) {
                    var impStep = proof.steps[steps[0]].getSentence();
                    if (impStep[0] !== "->")
                        return "MT: 1st referenced step must be implication.";
                    var left = impStep[1], right = impStep[2];
                    var negStep = proof.steps[steps[1]].getSentence();
                    if (negStep[0] !== "not" || !this.semanticEq(negStep[1], right))
                        return "MT: 2nd ref step must be negation of right side of 1st ref step.";
                    var s = proof.steps[step].getSentence();
                    if (s[0] !== 'not' || !this.semanticEq(left, s[1]))
                        return "MT: current step must be negation of left side of ref step.";
                    return true;
                })
            },
            "pbc": {
                Name: "PBC",
                Type: "derived",
                SimpleVerifier: new Justifier({ HasPart: false, StepRefs: ["range"], Substitution: false }, function (proof, step, part, steps) {
                    var assumptionExpr = proof.steps[steps[0][0]].getSentence();
                    var contraExpr = proof.steps[steps[0][1]].getSentence();
                    if (!this.isContradiction(contraExpr)) {
                        return "PBC: Final step in range must be a contradiction.";
                    }
                    if (assumptionExpr[0] !== 'not')
                        return "PBC: Assumption is not a negation. Might you be thinking of not-introduction?";
                    var semEq = this.semanticEq(assumptionExpr[1], proof.steps[step].getSentence());
                    if (semEq)
                        return true;
                    return "PBC: Negation of assumption doesn't match current step.";
                })
            },
            "contra": {
                Name: "Contradiction",
                Type: "normal",
                ElimVerifier: new Justifier({ HasPart: false, StepRefs: ["num"], Substitution: false }, function (proof, step, part, steps) {
                    var refStep = proof.steps[steps[0]].getSentence();
                    if (refStep[0] != 'id' || (refStep[1] != 'contradiction' && refStep[1] != '_|_'))
                        return "Contra-elim: Referenced step is not a contradiction.";
                    return true;
                })
            },
            "notnot": {
                Name: "Double-negation",
                Type: "normal",
                ElimVerifier: new Justifier({ HasPart: false, StepRefs: ["num"], Substitution: false }, function (proof, step, part, steps) {
                    var curStep = proof.steps[step].getSentence();
                    var refStep = proof.steps[steps[0]].getSentence();
                    if (refStep[0] !== 'not' || refStep[1][0] !== 'not')
                        return "Notnot-elim: Referenced step is not a double-negation.";
                    if (!this.semanticEq(refStep[1][1], curStep))
                        return "Notnot-elim: Does not result in current step.";
                    return true;
                })
            },
            "->": {
                Name: "Implication",
                Type: "normal",
                IntroVerifier: new Justifier({ HasPart: false, StepRefs: ["range"], Substitution: false }, function (proof, step, part, steps) {
                    var truth = proof.steps[steps[0][0]].getSentence();
                    var result = proof.steps[steps[0][1]].getSentence();
                    var implies = proof.steps[step].getSentence();
                    if (implies[0] != '->')
                        return "Implies-Intro: Current step is not an implication";
                    var truthSemEq = this.semanticEq(implies[1], truth);
                    if (!truthSemEq)
                        return "Implies-Intro: The left side does not match the assumption.";
                    var resultSemEq = this.semanticEq(implies[2], result);
                    if (!resultSemEq)
                        return "Implies-Intro: The result does not match the right side.";
                    return true;
                }),
                ElimVerifier: new Justifier({ HasPart: false, StepRefs: ["num", "num"], Substitution: false }, function (proof, step, part, steps) {
                    var truthStep = steps[1], impliesStep = steps[0];
                    if (truthStep >= step || impliesStep >= step)
                        return "Implies-Elim: Referenced proof steps must precede current step.";
                    var truth = proof.steps[truthStep].getSentence();
                    var implies = proof.steps[impliesStep].getSentence();
                    if (implies[0] != '->')
                        return "Implies-Elim: Step " + steps[0] + " is not an implication";
                    var truthSemEq = this.semanticEq(implies[1], truth);
                    var resultSemEq = this.semanticEq(implies[2], proof.steps[step].getSentence());
                    if (truthSemEq) {
                        if (resultSemEq) {
                            return true;
                        }
                        else {
                            return "Implies-Elim: The left side does not imply this result.";
                        }
                    }
                    return "Implies-Elim: The implication's left side does not match the referenced step.";
                })
            },
            "and": {
                Name: "And",
                Type: "normal",
                IntroVerifier: new Justifier({ StepRefs: ["num", "num"] }, function (proof, step, part, steps) {
                    var s = proof.steps[step].getSentence();
                    if (s[0] !== 'and')
                        return "And-Intro: Current step is not an 'and'-expression." + proof.steps[step].getSentence();
                    if (this.semanticEq(s[1], proof.steps[steps[0]].getSentence())) {
                        if (this.semanticEq(s[2], proof.steps[steps[1]].getSentence())) {
                            return true;
                        }
                        else {
                            return "And-Intro: Right side doesn't match referenced step.";
                        }
                    }
                    return "And-Intro: Left side doesn't match referenced step.";
                }),
                ElimVerifier: new Justifier({ HasPart: true, StepRefs: ["num"] }, function (proof, step, part, steps) {
                    var andExp = proof.steps[steps[0]].getSentence();
                    if (andExp[0] != 'and')
                        return "And-Elim: Referenced step is not an 'and' expression.";
                    var semEq = this.semanticEq(andExp[part], proof.steps[step].getSentence());
                    if (semEq)
                        return true;
                    return "And-Elim: In referenced line, side " + part + " does not match current step.";
                })
            },
            "or": {
                Name: "Or",
                Type: "normal",
                IntroVerifier: new Justifier({ HasPart: true, StepRefs: ["num"] }, function (proof, step, part, steps) {
                    var s = proof.steps[step].getSentence();
                    if (s[0] !== 'or')
                        return "Or-Intro: Current step is not an 'or'-expression.";
                    if (this.semanticEq(s[part], proof.steps[steps[0]].getSentence()))
                        return true;
                    return "Or-Intro: Side " + part + " doesn't match referenced step.";
                }),
                ElimVerifier: new Justifier({ StepRefs: ["num", "range", "range"] }, function (proof, step, part, steps) {
                    var currStepExpr = proof.steps[step].getSentence();
                    var orStepExpr = proof.steps[steps[0]].getSentence();
                    var a1p1Expr = proof.steps[steps[1][0]].getSentence();
                    var a1p2Expr = proof.steps[steps[1][1]].getSentence();
                    var a2p1Expr = proof.steps[steps[2][0]].getSentence();
                    var a2p2Expr = proof.steps[steps[2][1]].getSentence();
                    // and through the gauntlet...
                    if (orStepExpr[0] !== 'or')
                        return "Or-Elim: First referenced step is not an 'or'-expression.";
                    if (!this.semanticEq(orStepExpr[1], a1p1Expr))
                        return "Or-Elim: First range intro doesn't match left side of 'or'.";
                    if (!this.semanticEq(orStepExpr[2], a2p1Expr))
                        return "Or-Elim: Second range range intro doesn't match right side of 'or'.";
                    if (!this.semanticEq(a1p2Expr, a2p2Expr))
                        return "Or-Elim: Step range conclusions don't match.";
                    if (!this.semanticEq(a1p2Expr, currStepExpr))
                        return "Or-Elim: Current step doesn't match step range conclusions.";
                    return true;
                })
            },
            "not": {
                Name: "Not",
                Type: "normal",
                IntroVerifier: new Justifier({ StepRefs: ["range"] }, function (proof, step, part, steps) {
                    var assumptionExpr = proof.steps[steps[0][0]].getSentence();
                    var contraExpr = proof.steps[steps[0][1]].getSentence();
                    if (!this.isContradiction(contraExpr)) {
                        return "Not-Intro: Final step in range must be a contradiction.";
                    }
                    var curStep = proof.steps[step].getSentence();
                    if (curStep[0] !== 'not') {
                        return "Not-Intro: Current step is not a negation. Might you be thinking of PBC?";
                    }
                    else {
                        var semEq = this.semanticEq(assumptionExpr, curStep[1]);
                        if (semEq)
                            return true;
                        return "Not-Intro: Negation of assumption doesn't match current step.";
                    }
                }),
                ElimVerifier: new Justifier({ StepRefs: ["num", "num"] }, function (proof, step, part, steps) {
                    var s = proof.steps[step].getSentence();
                    if (!this.isContradiction(s))
                        return "Not-Elim: Current step is not a contradiction." + proof.steps[step].getSentence();
                    var step1expr = proof.steps[steps[0]].getSentence();
                    var step2expr = proof.steps[steps[1]].getSentence();
                    var semEq;
                    if (step1expr[0] === 'not') {
                        semEq = this.semanticEq(step1expr[1], step2expr);
                    }
                    else if (step2expr[0] === 'not') {
                        semEq = this.semanticEq(step2expr[1], step1expr);
                    }
                    else {
                        return "Not-Elim: Neither referenced proof step is a 'not' expression.";
                    }
                    if (semEq)
                        return true;
                    return "Not-Elim: Subexpression in not-expr does not match other expr.";
                })
            },
            "a.": {
                Name: "ForAll",
                Type: "normal",
                IntroVerifier: new Justifier({ StepRefs: ["range"], Substitution: true }, function (proof, step, part, steps, subst) {
                    var currStep = proof.steps[step];
                    var currExpr = currStep.getSentence();
                    var startStep = proof.steps[steps[0][0]];
                    var startExpr = startStep.getSentence();
                    var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
                    var endExpr = proof.steps[steps[0][1]].getSentence();
                    if (currExpr[0] !== 'forall')
                        return "All-x-Intro: Current step is not a 'for-all' expression.";
                    if (scope.length == 0 || scope[0] == null)
                        return "All-x-Intro: Not valid without a scoping assumption (e.g., an x0 box).";
                    // check if any substitutions from our scope match refExpr
                    var scopeVar = scope[scope.length - 1];
                    var found = scope.slice().reverse().reduce(function (a, e) { return a && (e == null || e == subst[1]); }, true);
                    if (!found)
                        return "All-x-intro: Substitution " + subst[1] + " doesn't match scope: " + scope.filter(function (e) { if (e != null)
                            return e; }).join(", ");
                    var endExprSub = this.substitute(endExpr, subst[1], subst[0]);
                    if (this.semanticEq(endExprSub, currExpr[2]))
                        return true;
                    return "All-x-Intro: Last step in range doesn't match current step after " + subst[0] + "/" + subst[1] + ".";
                }),
                ElimVerifier: new Justifier({ StepRefs: ["num"], Substitution: true }, function (proof, step, part, steps, subst) {
                    var currStep = proof.steps[step];
                    var currExpr = currStep.getSentence();
                    var refExpr = proof.steps[steps[0]].getSentence();
                    if (refExpr[0] !== 'forall')
                        return "All-x-Elim: Referenced step is not a for-all expression.";
                    var refExprSub = this.substitute(refExpr[2], subst[0], subst[1]);
                    if (this.semanticEq(refExprSub, currExpr))
                        return true;
                    return "All-x-Elim: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + ".";
                })
            },
            "e.": {
                Name: "Exists",
                Type: "normal",
                IntroVerifier: new Justifier({ StepRefs: ["num"], Substitution: true }, function (proof, step, part, steps, subst) {
                    var currStep = proof.steps[step];
                    var currExpr = currStep.getSentence();
                    var refExpr = proof.steps[steps[0]].getSentence();
                    if (currExpr[0] !== 'exists')
                        return "Exists-x-Intro: Current step is not an 'exists' expression.";
                    var refExprSub = this.substitute(refExpr, subst[1], subst[0]);
                    if (this.semanticEq(refExprSub, currExpr[2]))
                        return true;
                    return "Exists-x-Intro: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + " substitution.";
                }),
                ElimVerifier: new Justifier({ StepRefs: ["num", "range"], Substitution: true }, function (proof, step, part, steps, subst) {
                    var currStep = proof.steps[step];
                    var currExpr = currStep.getSentence();
                    var refExpr = proof.steps[steps[0]].getSentence();
                    var startStep = proof.steps[steps[1][0]];
                    var startExpr = startStep.getSentence();
                    var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
                    var endExpr = proof.steps[steps[1][1]].getSentence();
                    if (refExpr[0] !== 'exists')
                        return "Exists-x-Elim: Referenced step is not an 'exists' expression.";
                    if (scope.length == 0 || scope[scope.length - 1] == null)
                        return "Exists-x-Elim: Range must be within an assumption scope (e.g., an x0 box).";
                    // check whether substition matches ref line with current line
                    var scopeVars = scope[scope.length - 1];
                    var refExprSub = this.substitute(refExpr[2], subst[0], subst[1]);
                    if (this.semanticEq(refExprSub, startExpr)) {
                        if (this.semanticEq(endExpr, currExpr))
                            return true;
                        return "Exists-x-Elim: assumption ending step does not match current step.";
                    }
                    return "Exists-x-Elim: assumption beginning step doesn't match ref step for " + scopeVars[0] + ".";
                })
            },
            "=": {
                Name: "Equality",
                Type: "normal",
                IntroVerifier: new Justifier({ StepRefs: null /* no params required */ }, function (proof, step, part, steps) {
                    var s = proof.steps[step].getSentence();
                    if (s[0] !== '=')
                        return "Equality-Intro: Current step is not an equality." + proof.steps[step].getSentence();
                    if (this.semanticEq(s[1], s[2]))
                        return true;
                    return "Equality-Intro: Left and right sides do not match.";
                }),
                ElimVerifier: new Justifier({ StepRefs: ["num", "num"] }, function (proof, step, part, steps) {
                    var equalityExpr = proof.steps[steps[0]].getSentence();
                    var elimExpr = proof.steps[steps[1]].getSentence();
                    var proposedResult = proof.steps[step].getSentence();
                    if (equalityExpr[0] !== '=')
                        return "Equality-Elim: First referenced step is not an equality.";
                    if (!this.semanticEq(elimExpr, proposedResult, equalityExpr[1], equalityExpr[2]))
                        return "Equality-Elim: Does not result in current step.";
                    return true;
                })
            },
        };
    }
    FOLRulebookFactory.prototype.BuildRulebook = function () {
        return this.rules;
    };
    FOLRulebookFactory.prototype.substitute = function (startExpr, a, b, bound) {
        this.debug("substitute", startExpr, a, b);
        bound = bound ? bound : [];
        var binOps = ["->", "and", "or", "<->", "="];
        var unOps = ["not", "forall", "exists"];
        // remove parens, which are basically stylistic no-ops
        while (startExpr[0] === 'paren')
            startExpr = startExpr[1];
        if (this.arrayContains(binOps, startExpr[0])) {
            var leftSide = this.substitute(startExpr[1], a, b);
            var rightSide = this.substitute(startExpr[2], a, b);
            return [startExpr[0], leftSide, rightSide];
        }
        else if (this.arrayContains(unOps, startExpr[0])) {
            if (startExpr[0] === "forall" || startExpr[0] === "exists") {
                bound = bound.slice(0);
                bound.push(startExpr[1]);
                return [startExpr[0], startExpr[1],
                    this.substitute(startExpr[2], a, b, bound)];
            }
            return [startExpr[0], this.substitute(startExpr[1], a, b, bound)];
        }
        else if (startExpr[0] === 'id') {
            if (startExpr.length === 2) {
                if (!this.arrayContains(bound, startExpr[1])) {
                    if (startExpr[1] === a)
                        return [startExpr[0], b];
                }
                return startExpr;
            }
            if (startExpr.length === 3) {
                var newTerms = [];
                for (var i = 0; i < startExpr[2].length; i++) {
                    newTerms.push(this.substitute(startExpr[2][i], a, b, bound));
                }
                return [startExpr[0], startExpr[1], newTerms];
            }
            throw Error("Unexpected AST format.");
        }
    };
    /**
     * Determines whether two expressions are semantically equivalent
     * under the given (and optional) substitution.
     * a, b - abstract syntax trees of the expressions to be compared.
     * suba, subb (optional) - does comparison after substituting suba in a with subb.
     */
    FOLRulebookFactory.prototype.semanticEq = function (A, B, suba, subb) {
        this.debug("semanticEq", A, B);
        var bound = {}, sub;
        if (suba) {
            sub = true;
            return _rec(A, B, {});
        }
        else {
            sub = false;
            return _rec(A, B);
        }
        function _rec(a, b, bound) {
            var binOps = ["->", "and", "or", "<->", "="];
            var unOps = ["not"];
            // if eq w/substitution, return true, otherwise continue
            if (sub && this.semanticEq(a, suba)) {
                if ((a[0] !== 'id' || !bound[a[1]]) && _rec(subb, b, bound))
                    return true;
            }
            if (this.arrayContains(binOps, a[0]) && a[0] === b[0]) {
                if (_rec(a[1], b[1], bound) && _rec(a[2], b[2], bound)) {
                    return true;
                }
                return false;
            }
            else if (this.arrayContains(unOps, a[0]) && a[0] === b[0]) {
                if (_rec(a[1], b[1], bound)) {
                    return true;
                }
                return false;
            }
            else if (a[0] === 'exists' || a[0] === 'forall' && a[0] === b[0]) {
                var newb;
                if (sub) {
                    newb = this.clone(bound);
                    newb[a[1]] = true;
                }
                if (_rec(a[2], b[2], newb)) {
                    return true;
                }
                return false;
            }
            else if (a[0] === "id") {
                if (b && a[1] !== b[1])
                    return false;
                if (a.length == 2 && b.length == 2) {
                    return true;
                }
                if (a.length == 3 && b.length == 3) {
                    if (a[2].length != b[2].length) {
                        return false;
                    }
                    for (var i = 0; i < a[2].length; i++) {
                        if (!_rec(a[2][i], b[2][i], bound)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            return false;
        }
    };
    FOLRulebookFactory.prototype.isContradiction = function (s) {
        return (s[0] === 'id' && (s[1] === '_|_' || s[1] === 'contradiction'));
    };
    FOLRulebookFactory.prototype.arrayContains = function (arr, el) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === el)
                return true;
        }
        return false;
    };
    FOLRulebookFactory.prototype.clone = function (obj) {
        var newo = {};
        for (var k in Object.keys(obj)) {
            newo[k] = obj[k];
        }
        return newo;
    };
    return FOLRulebookFactory;
})();
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
var VerificationResult = (function () {
    function VerificationResult(Valid, Message, ErrorStep, ErrorMeta) {
        if (Valid === void 0) { Valid = false; }
        if (Message === void 0) { Message = ""; }
        if (ErrorStep === void 0) { ErrorStep = -1; }
        if (ErrorMeta === void 0) { ErrorMeta = null; }
        this.Valid = Valid;
        this.Message = Message;
        this.ErrorStep = ErrorStep;
        this.ErrorMeta = ErrorMeta;
    }
    return VerificationResult;
})();
var Proof = (function () {
    function Proof() {
    }
    return Proof;
})();

},{}]},{},[1])(1)
});