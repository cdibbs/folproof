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
					
				if (!semanticEq(elimExpr, proposedResult, equalityExpr[1], equalityExpr[2]))
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

/**
 * Determines whether two expressions are semantically equivalent
 * under the given (and optional) substitution.
 * a, b - abstract syntax trees of the expressions to be compared.
 * suba, subb (optional) - does comparison after substituting suba in a with subb.
 */
function semanticEq(A, B, suba, subb) {
	u.debug("semanticEq", A, B);
	var bound = {}, sub;
	if (suba) {
		sub = true;
		return _rec(A, B, {});
	} else {
		sub = false;
		return _rec(A, B);
	}

	function _rec(a, b, bound) {
		var binOps = ["->", "and", "or", "<->", "="];
		var unOps = ["not"];

		// if eq w/substitution, return true, otherwise continue
		if (sub && semanticEq(a, suba)) {
				if ((a[0] !== 'id' || !bound[a[1]]) && _rec(subb, b, bound)) return true;
		}

		if (arrayContains(binOps, a[0]) && a[0] === b[0]) {
			if (_rec(a[1], b[1], bound) && _rec(a[2], b[2], bound)) {
				return true;
			}
			return false;
		} else if (arrayContains(unOps, a[0]) && a[0] === b[0]) {
			if (_rec(a[1], b[1], bound)) {
				return true;
			}
			return false;
		} else if (a[0] === 'exists' || a[0] === 'forall' && a[0] === b[0]) {
			var newb;
			if (sub) {
				newb = clone(bound);
				newb[a[1]] = true;
			}
			if (_rec(a[2], b[2], newb)) {
				return true;
			}
			return false;
		} else if (a[0] === "id") {
			if (b && a[1] !== b[1]) return false;
			if (a.length == 2 && b.length == 2) {
				return true;
			}

			if (a.length == 3 && b.length == 3) {
				if (a[2].length != b[2].length) {
					return false;
				}
				for (var i=0; i<a[2].length; i++) {
					if (!_rec(a[2][i], b[2][i], bound)) {
						return false;
					}
				}
				return true;
			}
		}
		return false;
	}
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

function clone(obj) {
	var newo = {};
	for(var k in Object.keys(obj)) {
		newo[k] = obj[k];
	}
	return newo;
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	module.exports = rules;
}
