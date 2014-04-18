var u = require("./util");
var Rule = require("./rule.js");
var Justifier = require("./justifier.js");

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
			{ stepRefs : ["range"] },
			function(proof, step, part, steps, newv) {
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
				var scopeVars = scope[scope.length-1];
				var endExprSub = substitute(endExpr, scopeVars[0], newv);
				if (semanticEq(endExprSub, currExpr[2]))
					return true;
				return "All-x-Intro: Last step in range doesn't match current step after " + scopeVars[0] + "/" + scopeVars[1] + ".";
			}),
		elimination : new Justifier(
			{ stepRefs : ["num"] },
			function(proof, step, part, steps) {
				var currStep = proof.steps[step];
				var currExpr = currStep.getSentence();
				var scope = currStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
				var refExpr = proof.steps[steps[0]].getSentence();
				if (refExpr[0] !== 'forall')
					return "All-x-Elim: Referenced step is not a for-all expression.";
				if (scope.length == 0)
					return "All-x-Elim: Not valid outside an assumption scope (e.g., an x0 box).";
		
				// check if any substitutions from our scope match refExpr
				var checked = [];
				for (var i=scope.length-1; i>=0; i--) {
					checked.push(scope[i][0]);
					var refExprSub = substitute(refExpr[2], scope[i][1], scope[i][0]);
					if (semanticEq(refExprSub, currExpr))
						return true;
				}

				return "All-x-Elim: Referenced step did not match current step under: " + checked.join(", ") + ".";
			})
	}),
	"e." : new Rule({
		name : "Exists",
		type : "normal",
		introduction : new Justifier(
			{ stepRefs: ["num"] },
			function(proof, step, part, steps, newv) {
				var currStep = proof.steps[steps[0]];
				var currExpr = currStep.getSentence();
				var scope = currStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
				var refExpr = proof.steps[steps[0]].getSentence();
				if (currExpr[0] !== 'exists')
					return "Exists-x-Intro: Current step is not an 'exists' expression.";
				if (scope.length == 0)
					return "Exists-x-Intro: Not valid outside an assumption scope (e.g., an x0 box).";
		
				// check if any substitutions from our scope match refExpr
				var checked = [];
				for (var i=scope.length-1; i>=0; i--) {
					checked.push(scope[i][0]);
					var refExprSub = substitute(refExpr, scope[i][0], scope[i][1]);
					if (semanticEq(refExprSub, currExpr[2]))
					return true;
				}
	
				return "Exists-x-Elim: Referenced step did not match current step under: " + checked.join(", ") + ".";
			}),
		elimination : new Justifier(
			{ stepRefs: ["num", "range"] },
			function(proof, step, part, steps) {
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
		
				// check if any substitutions from our scope match refExpr
				var scopeVars = scope[scope.length-1];
				var refExprSub = substitute(refExpr[2], scopeVars[1], scopeVars[0]);
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

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	module.exports = rules;
}
