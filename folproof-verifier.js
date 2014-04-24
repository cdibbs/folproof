!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.folproof=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var u = _dereq_("./util");

var Justifier = function Justifier(format, fn) {
	// format = { hasPart : (true/false), stepRefs : ("num" | "range")*, subst : (true/false) };
	var self = this;

	this.exec = function(proof, step, part, steps, subst) {
		u.debug(step, part, steps, subst);
		var checked = self.checkParams(step, part, steps, subst);
		if (typeof checked === "string") return checked;
		return fn(proof, step, checked[0], checked[1], checked[2]);
	};

	this.checkParams = function checkParams(curStep, part, steps, subst) {
		if (format === null) {
			if (part != null) 
				return "Step part (e.g., 2 in 'and e2') not applicable, in this context.";
			if (steps != null)
				return "Step references not applicable.";
			if (subst != null)
				return "Substitutions not applicable.";
			return [];
		}

		var partNum = null, refNums = [], w = null;
		if (format.hasPart) {
			partNum = parseInt(part);
			if (!(partNum == 1 || partNum == 2))
				return "Part number must be 1 or 2";
		} else
			if (part != null)
				return "Step part (e.g., 2 in 'and e2') not applicable, in this context.";
		
		if (format.stepRefs) {
			if (steps.length != format.stepRefs.length) {
				var f = format.stepRefs.map(function(e) { return e == "num" ? "n" : "n-m" });
				return "Step reference mismatch; required format: " + f.join(", ") + ".";
			}
			for (var i=0; i<steps.length; i++) {
				if (format.stepRefs[i] == "num") {
					var n = parseInt(steps[i]) - 1;
					if (!(n >= 0 && n < curStep))
						return "Step reference #" + (i + 1) + " must be 1 <= step < current.";
					refNums.push(n);
				} else {
					var ab = steps[i].split("-");
					if (ab.length != 2)
						return "Step reference # " + (i + 1) + " must be range, a-b, with a <= b.";
					
					ab = [parseInt(ab[0]) - 1, parseInt(ab[1]) - 1];
					if (ab[0] > ab[1] || Math.max(ab[0], ab[1]) >= curStep)
						return "Step reference # " + (i + 1) + " must be range, a-b, with a <= b.";
					refNums.push(ab);
				}
			}
		} else {
			if (steps != null)
				return "Step references not applicable, here.";
		}
		
		if (format.subst) {
			if (!subst)
				return "Substitution specification required (e.g., A.x/x0 intro n-m)";
			w = subst.map(function(e) { return e.match("^[A-Za-z_][A-Za-z_0-9]*$"); });
			var allValidIds = w.reduce(function(a, e) { return a && e && e.length == 1 && e[0] });
			if (w.length != 2 || !allValidIds)
				return "Substitution format must match (e.g., A.x/x0 intro n-m.)";

			w = w.map(function(e) { return e[0] });
		} else {
			if (subst)
				return "Substitution unexpected.";
		}

		return [partNum, refNums, w];
	};
};

module.exports = Justifier;

},{"./util":4}],2:[function(_dereq_,module,exports){
var Rule = function Rule(options) {
	// { name : name,
	//   type : ["simple", "derived", "normal"], 
	//   verifier : new Verifier(parseFormat, function(proof, step) {}),
	//   introduction : new Verifier(parseFormat, function(proof, step, part, steps, subst) {}),
	//   elimination : new Verifier(parseFormat, function(proof, step, part, steps, subst) {})
	// }
	this.getName = function getName() { return options.name; };
	this.getType = function getType() { return options.type; };
	this.getSimpleVerifier = function getSimpleVerifier() { return options.verifier || null; };
	this.getIntroVerifier = function getIntroVerifier() { return options.introduction || null; };
	this.getElimVerifier = function getElimVerifier() { return options.elimination || null; };
};

module.exports = Rule;

},{}],3:[function(_dereq_,module,exports){
var u = _dereq_("./util");
var Rule = _dereq_("./rule.js");
var Justifier = _dereq_("./justifier.js");

var rules = {
	"premise" : new Rule({
		name : "Premise",
		type : "simple",
		verifier : new Justifier(null, function(proof, step) { return true; })
		}),
	"assumption" : new Rule({
		name : "Assumption",
		type : "simple",
		verifier : new Justifier(null, function(proof, step) {
				if (proof.steps[step].isFirstStmt())
					return true;
				return "Assumptions can only be made at the start of an assumption box.";
			})
		}),
	"pbc" : new Rule({
		name : "PBC",
		type : "derived",
		verifier : new Justifier(
		{ hasPart : false, stepRefs : ["range"], subst : false },
		function(proof, step, part, steps) {	
			var assumptionExpr = proof.steps[stepRange[0]].getSentence();
			var contraExpr = proof.steps[stepRange[1]].getSentence();
			if (! isContradiction(contraExpr)) {
			return "PBC: Final step in range must be a contradiction.";
			}
	
			if (assumptionExpr[0] !== 'not')
			return "PBC: Assumption is not a negation. Might you be thinking of not-introduction?";
		
			var semEq = semanticEq(assumptionExpr[1], proof.steps[step].getSentence());
			if (semEq)
			return true;

			return "PBC: Negation of assumption doesn't match current step.";
		})
		}),
	"contra" : new Rule({
			name : "Contradiction",
			type : "normal",
			elimination : new Justifier(
				{ hasPart : false, stepRefs : ["num"], subst : false },
				function(proof, step, part, steps) {
					var refStep = proof.steps[steps[0]].getSentence();
					if (refStep[0] != 'id' || (refStep[1] != 'contradiction' && refStep[1] != '_|_'))
						return "Contra-elim: Referenced step is not a contradiction.";

					return true;
				})
		}),
	"notnot" : new Rule({
			name : "Double-negation",
			type : "normal",
			elimination : new Justifier(
				{ hasPart : false, stepRefs : ["num"], subst : false },
				function(proof, step, part, steps) {
					var curStep = proof.steps[step].getSentence();
					var refStep = proof.steps[steps[0]].getSentence();
					if (refStep[0] !== 'not' || refStep[1][0] !== 'not')
						return "Notnot-elim: Referenced step is not a double-negation.";
					
					if (!semanticEq(refStep[1][1], curStep))
						return "Notnot-elim: Does not result in current step.";

					return true;
				})
		}),
	"->" : new Rule({
		name : "Implication",
		type : "normal",
		introduction : new Justifier(
			{ hasPart : false, stepRefs : ["range"], subst : false },
			function(proof, step, part, steps) {	
			var truth = proof.steps[steps[0][0]].getSentence();
			var result = proof.steps[steps[0][1]].getSentence();
			var implies = proof.steps[step].getSentence();
			if (implies[0] != '->')
			return "Implies-Intro: Current step is not an implication";

			var truthSemEq = semanticEq(implies[1], truth);
			if (! truthSemEq)
			return "Implies-Intro: The left side does not match the assumption.";

			var resultSemEq = semanticEq(implies[2], result);
			if (! resultSemEq)
			return "Implies-Intro: The result does not match the right side.";
	
			return true;
			}
		),
		elimination : new Justifier(
			{ hasPart : false, stepRefs : ["num", "num"], subst : false },
			function(proof, step, part, steps) {
			var truthStep = steps[1], impliesStep = steps[0];
			if (truthStep >= step || impliesStep >= step)
			return "Implies-Elim: Referenced proof steps must precede current step.";

			var truth = proof.steps[truthStep].getSentence();
			var implies = proof.steps[impliesStep].getSentence();
			if (implies[0] != '->')
			return "Implies-Elim: Step " + steps[0] + " is not an implication";
			var truthSemEq = semanticEq(implies[1], truth);
			var resultSemEq = semanticEq(implies[2], proof.steps[step].getSentence());
			if (truthSemEq) {
			if (resultSemEq) {
				return true;
			} else {
				return "Implies-Elim: The left side does not imply this result.";
			}
			}
		
			return "Implies-Elim: The implication's left side does not match the referenced step.";
			}
		)
		}),	
	"and" : new Rule({
		name : "And",
		type : "normal",
		introduction : new Justifier(
			{ stepRefs : ["num", "num"] },
			function(proof, step, part, steps) {
				var s = proof.steps[step].getSentence();
				if (s[0] !== 'and')
					return "And-Intro: Current step is not an 'and'-expression." + proof.steps[step].getSentence();

				if (semanticEq(s[1], proof.steps[steps[0]].getSentence())) {
					if (semanticEq(s[2], proof.steps[steps[1]].getSentence())) {
						return true;
					} else {
						return "And-Intro: Right side doesn't match referenced step.";
					}
				}
		
				return "And-Intro: Left side doesn't match referenced step.";
			}),
		elimination : new Justifier(
			{ hasPart: true, stepRefs: ["num"] },
			function(proof, step, part, steps) {
				var andExp = proof.steps[steps[0]].getSentence();
				if (andExp[0] != 'and')
					return "And-Elim: Referenced step is not an 'and' expression.";

				var semEq = semanticEq(andExp[part], proof.steps[step].getSentence());

				if (semEq)
					return true;

				return "And-Elim: In referenced line, side " + part + " does not match current step.";
			})
	}),
	"or" : new Rule({
		name : "Or",
		type : "normal",
		introduction : new Justifier(
			{ hasPart: true, stepRefs: ["num"] },
			function(proof, step, part, steps) {
				var s = proof.steps[step].getSentence();
				if (s[0] !== 'or')
					return "Or-Intro: Current step is not an 'or'-expression.";

				if (semanticEq(s[part], proof.steps[steps[0]].getSentence()))
				return true;

				return "Or-Intro: Side " + part + " doesn't match referenced step.";
			}),
		elimination : new Justifier(
			{ stepRefs : ["num", "range", "range"] },
			function(proof, step, part, steps) {
				var currStepExpr = proof.steps[step].getSentence();
				var orStepExpr = proof.steps[steps[0]].getSentence();
				var a1p1Expr = proof.steps[steps[1][0]].getSentence();
				var a1p2Expr = proof.steps[steps[1][1]].getSentence();
				var a2p1Expr = proof.steps[steps[2][0]].getSentence();
				var a2p2Expr = proof.steps[steps[2][1]].getSentence();
		
				// and through the gauntlet...
				if (orStepExpr[0] !== 'or')
					return "Or-Elim: First referenced step is not an 'or'-expression.";
				if (!semanticEq(orStepExpr[1], a1p1Expr))
					return "Or-Elim: First range intro doesn't match left side of 'or'.";
				if (!semanticEq(orStepExpr[2], a2p1Expr))
					return "Or-Elim: Second range range intro doesn't match right side of 'or'.";
				if (!semanticEq(a1p2Expr, a2p2Expr))
					return "Or-Elim: Step range conclusions don't match.";
				if (!semanticEq(a1p2Expr, currStepExpr))
					return "Or-Elim: Current step doesn't match step range conclusions.";

				return true;
			})
	}),
	"not" : new Rule({
		name : "Not",
		type : "normal",
		introduction : new Justifier(
			{ stepRefs: ["range"] },
			function(proof, step, part, steps) {
				var assumptionExpr = proof.steps[steps[0][0]].getSentence();
				var contraExpr = proof.steps[steps[0][1]].getSentence();
				if (! isContradiction(contraExpr)) {
					return "Not-Intro: Final step in range must be a contradiction.";
				}
				var curStep = proof.steps[step].getSentence();
				if (curStep[0] !== 'not') {
					return "Not-Intro: Current step is not a negation. Might you be thinking of PBC?";
				} else {
					var semEq = semanticEq(assumptionExpr, curStep[1]);
					if (semEq)
						return true;

					return "Not-Intro: Negation of assumption doesn't match current step.";
				}
			}),
		elimination : new Justifier(
			{ stepRefs: ["num", "num"] },
			function(proof, step, part, steps) {
				var s = proof.steps[step].getSentence();
				if (! isContradiction(s))
					return "Not-Elim: Current step is not a contradiction." + proof.steps[step].getSentence();

				var step1expr = proof.steps[steps[0]].getSentence();
				var step2expr = proof.steps[steps[1]].getSentence();
				var semEq;
				if (step1expr[0] === 'not') {
					semEq = semanticEq(step1expr[1], step2expr);
				} else if (step2expr[0] === 'not') {
					semEq = semanticEq(step2expr[1], step1expr);
				} else {
					return "Not-Elim: Neither referenced proof step is a 'not' expression.";
				}

				if (semEq) return true;
		
				return "Not-Elim: Subexpression in not-expr does not match other expr.";
			})
	}),
	"a." : new Rule({
		name : "ForAll",
		type : "normal",
		introduction : new Justifier(
			{ stepRefs : ["range"], subst : true },
			function(proof, step, part, steps, subst) {
				var currStep = proof.steps[step];
				var currExpr = currStep.getSentence();
				var startStep = proof.steps[steps[0][0]];
				var startExpr = startStep.getSentence();
				var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
				var endExpr = proof.steps[steps[0][1]].getSentence();
				if (currExpr[0] !== 'forall')
					return "All-x-Intro: Current step is not a 'for-all' expression.";
				if (scope.length == 0)
					return "All-x-Intro: Not valid without a scoping assumption (e.g., an x0 box).";
			
				// check if any substitutions from our scope match refExpr
				var scopeVar = scope[scope.length-1];
				var found = scope.slice().reverse().reduce(function(a,e) { return a && (e == null || e == subst[1]); }, true);
				if (! found)
					return "All-x-intro: Substitution " + subst[1] + " doesn't match scope: " + scope.filter(function(e) { if (e != null) return e; }).join(", ");

				var endExprSub = substitute(endExpr, subst[1], subst[0]);
				if (semanticEq(endExprSub, currExpr[2]))
					return true;
				return "All-x-Intro: Last step in range doesn't match current step after " + subst[0] + "/" + subst[1] + ".";
			}),
		elimination : new Justifier(
			{ stepRefs : ["num"], subst: true },
			function(proof, step, part, steps, subst) {
				var currStep = proof.steps[step];
				var currExpr = currStep.getSentence();
				var scope = currStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
				var refExpr = proof.steps[steps[0]].getSentence();
				if (refExpr[0] !== 'forall')
					return "All-x-Elim: Referenced step is not a for-all expression.";
				if (scope.length == 0)
					return "All-x-Elim: Not valid outside an assumption scope (e.g., an x0 box).";
		
				// check if any substitutions from our scope match refExpr
				if (! arrayContains(scope, subst[1]))
					return "All-x-Elim: Substition " + subst[1] + "/" + subst[0] + " does not exist in any outer scope.";

					var refExprSub = substitute(refExpr[2], subst[0], subst[1]);
					if (semanticEq(refExprSub, currExpr))
						return true;

				return "All-x-Elim: Referenced step did not match current step after " + scopeVars[1] + "/" + scopeVars[0] + ".";
			})
	}),
	"e." : new Rule({
		name : "Exists",
		type : "normal",
		introduction : new Justifier(
			{ stepRefs: ["num"], subst: true },
			function(proof, step, part, steps, subst) {
				var currStep = proof.steps[step];
				var currExpr = currStep.getSentence();
				var scope = currStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
				var refExpr = proof.steps[steps[0]].getSentence();
				if (currExpr[0] !== 'exists')
					return "Exists-x-Intro: Current step is not an 'exists' expression.";
				if (scope.length == 0)
					return "Exists-x-Intro: Not valid outside an assumption scope (e.g., an x0 box).";
		
				// check if any substitutions from our scope match refExpr
				if (! arrayContains(scope, subst[1]))
					return "Exists-x-Intro: Substition " + subst[1] + "/" + subst[0] + " does not exist in any outer scope.";

				var refExprSub = substitute(refExpr, subst[1], subst[0]);
				if (semanticEq(refExprSub, currExpr[2]))
					return true;
	
				return "Exists-x-Intro: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + " substitution.";
			}),
		elimination : new Justifier(
			{ stepRefs: ["num", "range"], subst: true },
			function(proof, step, part, steps, subst) {
				var currStep = proof.steps[step];
				var currExpr = currStep.getSentence();
				var refExpr = proof.steps[steps[0]].getSentence();
				var startStep = proof.steps[steps[1][0]];
				var startExpr = startStep.getSentence();
				var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
				var endExpr = proof.steps[steps[1][1]].getSentence();
				if (refExpr[0] !== 'exists')
					return "Exists-x-Elim: Referenced step is not an 'exists' expression.";
				if (scope.length == 0)
					return "Exists-x-Elim: Not valid outside an assumption scope (e.g., an x0 box).";
		
				// check whether substition matches ref line with current line
				var scopeVars = scope[scope.length-1];
				var refExprSub = substitute(refExpr[2], subst[0], subst[1]);
				if (semanticEq(refExprSub, startExpr)) {
					if (semanticEq(endExpr, currExpr))
						return true;
					return "Exists-x-Elim: assumption ending step does not match current step.";
				}
				return "Exists-x-Elim: assumption beginning step doesn't match ref step for " + scopeVars[0] + ".";
			})
	}),	
	"=" : new Rule({
		name : "Equality",
		type : "normal",
		introduction : new Justifier(
			{ /* no params required */ },
			function(proof, step, part, steps) {
				var s = proof.steps[step].getSentence();
				if (s[0] !== '=')
					return "Equality-Intro: Current step is not an equality." + proof.steps[step].getSentence();

				if (semanticEq(s[1], s[2]))
					return true;
		
				return "Equality-Intro: Left and right sides do not match.";
			}),
		elimination : new Justifier(
			{ stepRefs: ["num", "num"] },
			function(proof, step, part, steps) {
				var equalityExpr = proof.steps[steps[0]].getSentence();
				var elimExpr = proof.steps[steps[1]].getSentence();
				var proposedResult = proof.steps[step].getSentence();
				if (equalityExpr[0] !== '=')
					return "Equality-Elim: First referenced step is not an equality.";
					
				var elimExprT = elimTransform(elimExpr, equalityExpr[1], equalityExpr[2]);
				if (elimExprT === false || !semanticEq(elimExprT, proposedResult))
					return "Equality-Elim: Does not result in current step.";

				return true;
			})
	}),
};

function substitute(startExpr, a, b, bound) {
	u.debug("substitute", startExpr, a, b);
	bound = bound ? bound : [];
	var binOps = ["->", "and", "or", "<->", "="];
	var unOps = ["not", "forall", "exists"];

	// remove parens, which are basically stylistic no-ops
	while (startExpr[0] === 'paren') startExpr = startExpr[1];

	if (arrayContains(binOps, startExpr[0])) {
		var leftSide = substitute(startExpr[1], a, b);
		var rightSide = substitute(startExpr[2], a, b);
		return [startExpr[0], leftSide, rightSide];
	} else if (arrayContains(unOps, startExpr[0])) {
		if (startExpr[0] === "forall" || startExpr[0] === "exists") {
			bound = bound.slice(0);
			bound.push(startExpr[1]);
			return [startExpr[0], startExpr[1],
				substitute(startExpr[2], a, b, bound)];
		}
		
		return [startExpr[0], substitute(startExpr[1], a, b, bound)];
	} else if (startExpr[0] === 'id') {
		if (startExpr.length === 2) { // our loverly base case
			if (! arrayContains(bound, startExpr[1])) {
				if (startExpr[1] === a)
					return [startExpr[0], b];
			}
			return startExpr;
		}
		if (startExpr.length === 3) {
			var newTerms = [];
			for (var i=0; i<startExpr[2].length; i++) {
				newTerms.push(substitute(startExpr[2][i], a, b, bound));
			}
			return [startExpr[0], startExpr[1], newTerms];
		}
		throw Error("Unexpected AST format.");
	}
}

function elimTransform(startExpr, origSubExpr, newSubExpr) {
	u.debug("elimTransform", startExpr, origSubExpr, newSubExpr);
	var binOps = ["->", "and", "or", "<->", "="];
	var unOps = ["not"];

	// remove parens, which are basically stylistic no-ops
	while (startExpr[0] === 'paren') startExpr = startExpr[1];

	// Are we the thing to replace? Then return the new thing.
	if (semanticEq(startExpr, origSubExpr)) return newSubExpr;

	// if the rec call to elimT returns anything but false, return our part
	// of the AST rebuilt using what was returned.
	if (arrayContains(binOps, startExpr[0])) {
		var leftSide = elimTransform(startExpr[1], origSubExpr, newSubExpr);
		if (leftSide !== false) return [startExpr[0], leftSide, startExpr[2]];

		var rightSide = elimTransform(startExpr[2], origSubExpr, newSubExpr);
		if (rightSide !== false) return [startExpr[0], startExpr[1], rightSide];

		return false;
	} else if (arrayContains(unOps, startExpr[0])) {
		var inner = elimTransform(startExpr[1]);
		if (inner !== false) return [startExpr[0], inner];
		
		return false;
	} else if (startExpr[0] === 'id') {
		if (startExpr.length === 2) // then this is a base case ['id', $ID]
			return false;
		if (startExpr.length === 3) {
			var newTerms = [], found = false;
			for (var i=0; i<startExpr[2].length; i++) {
				var inner = elimTransform(startExpr[2][i], origSubExpr, newSubExpr);
				if (inner !== false) {
					newTerms.push(inner);
					found = true;
				} else {
					newTerms.push(startExpr[2][i]);
				}
			}
			if (found) return [startExpr[0], startExpr[1], newTerms];
		}
		return false;
	}	
}

function semanticEq(a, b) {
	u.debug("semanticEq", a, b);
	var binOps = ["->", "and", "or", "<->", "="];
	var unOps = ["not"];
	// remove parens, which are basically stylistic no-ops
	while (a[0] === 'paren') a = a[1];
	while (b[0] === 'paren') b = b[1];

	if (arrayContains(binOps, a[0]) && a[0] === b[0]) {
		if (semanticEq(a[1], b[1]) && semanticEq(a[2], b[2])) {
			u.debug("sEq path 1");
			return true;
		}
		u.debug("sEq path 1.1");
		return false;
	} else if (arrayContains(unOps, a[0]) && a[0] === b[0]) {
		if (semanticEq(a[1], b[1])) {
			u.debug("sEq path 2");
			return true;
		}
		u.debug("sEq path 2.1");
		return false;
	} else if (a[0] === 'exists' || a[0] === 'forall' && a[0] === b[0]) {
		if (semanticEq(a[2], b[2])) {
			u.debug("sEq path 2.5");
			return true;
		}
		u.debug("sEq path 2.6");
		return false;
	} else if (a[0] === "id") {
		if (a[1] !== b[1]) return false;
		if (a.length == 2 && b.length == 2) {
			u.debug("sEq path 3");
			return true;
		}

		if (a.length == 3 && b.length == 3) {
			if (a[2].length != b[2].length) {
				u.debug("sEq path 3.1");
				return false;
			}
			for (var i=0; i<a[2].length; i++) {
				if (!semanticEq(a[2][i], b[2][i])) {
					u.debug("sEq path 3.2");
					return false;
				}
			}
			u.debug("sEq path 3.3");
			return true;
		}
	}
	u.debug("sEq path 4");
	return false;
}

function isContradiction(s) {
	return (s[0] === 'id' && (s[1] === '_|_' || s[1] === 'contradiction'));
}

function arrayContains(arr, el) {
	for (var i=0; i<arr.length; i++) {
		if (arr[i] === el) return true;
	}
	return false;
}

if (typeof _dereq_ !== 'undefined' && typeof exports !== 'undefined') {
	module.exports = rules;
}

},{"./justifier.js":1,"./rule.js":2,"./util":4}],4:[function(_dereq_,module,exports){
var util = {};
util.debug = function debug() {
	if (typeof debugMode !== "undefined" && debugMode)
		console.log.apply(console, Array.prototype.slice.call(arguments));
};

if (typeof _dereq_ !== 'undefined' && typeof exports !== 'undefined') {
	module.exports = util;
}

},{}],5:[function(_dereq_,module,exports){
var rules = _dereq_("./rules");
var u = _dereq_("./util");

var Verifier = (function() {
	var debugMode = false;
	var obj = this;

	obj.verifyFromAST = function(ast) {
		var proof = preprocess(ast);
		return obj.verify(proof);
	};

	// proof = { 1 : Statement(), 2 : Statement() ... };
	obj.verify = function(proof) {
		var result = { message : "Proof is valid.", valid : true };
		for (var i=0; i<proof.steps.length; i++) {
			obj.validateStatement(result, proof, i);
			if (! result.valid) {
				break;
			}
		}
		return result;
	};

	obj.validateStatement = function validateStatement(result, proof, step) {
		var stmt = proof.steps[step];
		if (stmt[0] === 'error') {
			result.valid = false;
			result.message = "Proof invalid due to syntax errors."; 
			result.errorStep = step + 1;
			return;
		}

		var why = stmt.getJustification();
		var newv = null;
		if (why[0].split('.').length == 2)
			newv = why[0].split('.')[1];
		var validator = obj.lookupValidator(why);
		if (typeof validator === 'function') {
			var part = why[2], lines = why[3];
			var subst = null;
			if (newv && why[4]) subst = [newv, why[4]];
			var isValid = validator(proof, step, part, lines, subst);
			if (isValid === true) {
				result.valid = true;
			} else {
				result.valid = false;
				result.message = isValid;
				result.errorStep = step + 1;
				result.errorSrcLoc = stmt.getMeta();
			}
			return;
		} else if (typeof validator === "string") {
			result.valid = false;
			result.message = validator;
			result.errorStep = step + 1;
			result.errorSrcLoc = stmt.getMeta();
		}
		result.valid = false;
	};

	obj.lookupValidator = function lookupValidator(why) {
		var name = why[0].toLowerCase();
		if (name.split('.').length == 2)
			name = name.split('.')[0] + ".";
		var rule = rules[name];
		if (!rule) return "Cannot find rule: " + name;
		if (rule.getType() === "simple" || rule.getType() === "derived") {
			var fn = rule.getSimpleVerifier();
			if (!fn) throw new Error("Not implemented for " + name);
			return fn.exec;
		}

		if (why[1]) {
			var elimOrIntro = why[1].toLowerCase();
			if ("introduction".indexOf(elimOrIntro) === 0) {
				var fn = rule.getIntroVerifier();
				if (!fn) throw new Error("Not implemented for " + name);
				return fn.exec;
			} else if ("elimination".indexOf(elimOrIntro) === 0) {
				var fn = rule.getElimVerifier();
				if (!fn) throw new Error("Not implemented for " + name);
				return fn.exec;
			}
			return "Cannot determine elim/intro rule type from " + elimOrIntro;
		}
		
		return "Unrecognized rule: " + why[0] + " " + (why[1] ? why[1] : "")  + (why[2] ? why[2] : "") + " " + (why[3] ? why[3] : "");
	}

	obj.preprocess = function preprocess(ast) {
		var proof = { steps : [] };
		obj.preprocessBox(proof, ast, 0, []);
		return proof;
	}

	obj.preprocessBox = function preprocessBox(proof, ast, step, scope) {
		for(var i=0; i<ast.length; i++) {
			if (ast[i][0] === 'rule') {
				proof.steps[step] = new Statement(ast[i][1], ast[i][2], scope, ast[i][3], i == 0, i == ast.length - 1);
				step = step + 1;
			} else if (ast[i][0] === 'folbox') {
				var newScope = scope.slice(0)
				newScope.push(ast[i][2][1]);
				step = obj.preprocessBox(proof, ast[i][1], step, newScope);
			} else if (ast[i][0] === 'box') {
				var newScope = scope.slice(0)
				newScope.push(null);
				step = obj.preprocessBox(proof, ast[i][1], step, newScope);
			} else if (ast[i][0] === 'error') {
				proof.steps[step] = ast[i];
			}
		}
		return step;
	}

	var Statement = function(sentenceAST, justificationAST, scope, loc, isFirst, isLast) {
		this.isFirstStmt = function() { return isFirst; };
		this.isLastStmt = function() { return isLast; };
		this.getSentence = function getSentence() { return sentenceAST;	};
		this.getScope = function getScope() { return scope; }
		this.getJustification = function getJustification() { return justificationAST; };
		this.getMeta = function() { return loc; }
	};
	
	return obj;
})();

if (typeof _dereq_ !== 'undefined' && typeof exports !== 'undefined') {
	exports.Verifier = Verifier;
}

},{"./rules":3,"./util":4}]},{},[5])
(5)
});