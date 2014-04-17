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
		verifier : new Justifier(null, function(proof, step) { return true; })
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
		introduction : function(proof, step, part, steps) {
		debug("and-i", step, part, steps);
		if (part != null)
			return "And-Intro: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

		if (steps.length != 2)
			return "And-Intro: Requires two, prior-step references.";
		var andSteps = [parseInt(steps[0]) - 1, parseInt(steps[1]) - 1];

		if (andSteps[0] >= step || andSteps[1] >= step)
			return "And-Intro: Both steps must precede the current step.";

		var s = proof.steps[step].getSentence();
		if (s[0] !== 'and')
			return "And-Intro: Current step is not an 'and'-expression." + proof.steps[step].getSentence();

		if (semanticEq(s[1], proof.steps[andSteps[0]].getSentence())) {
			if (semanticEq(s[2], proof.steps[andSteps[1]].getSentence())) {
			return true;
			} else {
			return "And-Intro: Right side doesn't match referenced step.";
			}
		}
		
		return "And-Intro: Left side doesn't match referenced step.";
		},
		elimination : function(proof, step, part, steps) {
		debug("and-e", step, part, steps);
		if (part != 1 && part != 2)
			return "And-Elim: Must reference a side, like ': and e1 [lineNum]'";

		var andStep = parseInt(steps[0]) - 1;
		if (andStep >= step)
			return "And-Elim: Referenced proof steps must precede current step.";
			
		var andExp = proof.steps[andStep].getSentence();
		if (andExp[0] != 'and')
			return "And-Elim: Referenced step is not an 'and' expression.";

		var semEq = semanticEq(andExp[part], proof.steps[step].getSentence());
		if (semEq)
			return true;

		return "And-Elim: In referenced line, side " + part + " does not match current step.";
		}
	}),
	"or" : new Rule({
		name : "Or",
		type : "normal",
		introduction : function(proof, step, part, steps) {
		debug("or-i", step, part, steps);
		if (part != 1 && part != 2)
			return "Or-Intro: Must reference step side 1 or 2 (e.g., the 2 in 'or i2 n').";

		if (steps.length != 1)
			return "Or-Intro: Requires one, prior-step reference.";
		var orStep = parseInt(steps[0]) - 1;

		if (orStep >= step)
			return "Or-Intro: Referenced step must precede the current step.";

		var s = proof.steps[step].getSentence();
		if (s[0] !== 'or')
			return "Or-Intro: Current step is not an 'or'-expression.";

		if (semanticEq(s[part], proof.steps[orStep].getSentence()))
			return true;

		return "Or-Intro: Side " + part + " doesn't match referenced step.";
		},
		elimination : function(proof, step, part, steps) {
		debug("or-e", step, part, steps);
		if (part != null)
			return "Or-Elim: Step part (e.g., 2 in 'and e2') not applicable, in this context.";

		if (steps.length != 3 || steps[1].split("-").length != 2 || steps[2].split("-").length != 2)
			return "Or-Elim: Requires an 'or' step, and two assumption ranges: a, b-c, d-e.";

		var orStep = parseInt(steps[0]) - 1;
		var assm1StepR = steps[1].split("-");
		assm1StepR = [parseInt(assm1StepR[0]) - 1, parseInt(assm1StepR[1]) - 1];
		var assm2StepR = steps[2].split("-");
		assm2StepR = [parseInt(assm2StepR[0]) - 1, parseInt(assm2StepR[1]) - 1];

		if (orStep >= step || assm1StepR[0] >= step || assm1StepR[1] >= step
			|| assm2StepR[0] >= step || assm2StepR[1] >= step)
			return "Or-Elim: Referenced step must precede the current step.";
		
		var currStepExpr = proof.steps[step].getSentence();
		var orStepExpr = proof.steps[orStep].getSentence();
		var a1p1Expr = proof.steps[assm1StepR[0]].getSentence();
		var a1p2Expr = proof.steps[assm1StepR[1]].getSentence();
		var a2p1Expr = proof.steps[assm2StepR[0]].getSentence();
		var a2p2Expr = proof.steps[assm2StepR[1]].getSentence();
		
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
		}
	}),
	"not" : new Rule({
		name : "Not",
		type : "normal",
		introduction : function(proof, step, part, steps) {
		debug("not-i", step, part, steps);
		var stepRange = steps ? steps[0].split("-") : null;
		if (steps.length != 1 || stepRange.length != 2)
			return "Not-Intro: Unrecognized step reference format. Should be, e.g., 2-7.";

		stepRange = [parseInt(stepRange[0]) - 1, parseInt(stepRange[1]) - 1];
		if (stepRange[0] >= step || stepRange[1] >= step || stepRange[0] > stepRange[1])
			return "Not-Intro: Referenced proof step range, x-y, must precede current step, and x < y.";

		var assumptionExpr = proof.steps[stepRange[0]].getSentence();
		var contraExpr = proof.steps[stepRange[1]].getSentence();
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
		},
		elimination : function(proof, step, part, steps) {
		debug("not-e", step, part, steps);
		if (part != null)
			return "Not-Elim: Step part (e.g., 2 in 'and e2') not applicable, in this context.";

		var s = proof.steps[step].getSentence();
		if (! isContradiction(s))
			return "Not-Elim: Current step is not a contradiction." + proof.steps[step].getSentence();

		var step1 = parseInt(steps[0]) - 1;
		var step2 = parseInt(steps[1]) - 1;
		if (step1 >= step || step2 >= step)
			return "Not-Elim: Referenced proof steps must precede current step.";

		var step1expr = proof.steps[step1].getSentence();
		var step2expr = proof.steps[step2].getSentence();
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
		}
	}),
	"a." : new Rule({
		name : "ForAll",
		type : "normal",
		introduction : function(proof, step, part, steps, newv) {
		debug("all-x-i", step, part, steps);
		if (part != null)
			return "All-x-Intro: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

		if (steps.length != 1 || steps[0].split('-').length != 2)
			return "All-x-Intro: Must reference one range, a-b.";
		
		var stepRange = steps[0].split("-");
		stepRange = [parseInt(stepRange[0]) - 1, parseInt(stepRange[1]) - 1];
		if (stepRange[0] >= step || stepRange[1] >= step || stepRange[0] > stepRange[1])
			return "All-x-Intro: Requires range x-y, such that x, y precede current step, and x <= y.";
		
		var currStep = proof.steps[step];
		var currExpr = currStep.getSentence();
		var startStep = proof.steps[stepRange[0]];
		var startExpr = startStep.getSentence();
		var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
		var endExpr = proof.steps[stepRange[1]].getSentence();
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
		},
		elimination : function(proof, step, part, steps) {
		debug("all-x-e", step, part, steps);
		if (part != null)
			return "All-x-Elim: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

		if (steps == null || steps.length != 1)
			return "All-x-Elim: Must reference one prior proof step.";
		
		var refStep = parseInt(steps[0]) - 1;
		if (refStep >= step)
			return "All-x-Elim: Referenced step must occur before current step.";
		
		var currStep = proof.steps[step];
		var currExpr = currStep.getSentence();
		var scope = currStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
		var refExpr = proof.steps[refStep].getSentence();
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
		}
	}),
	"e." : new Rule({
		name : "Exists",
		type : "normal",
		introduction : function(proof, step, part, steps, newv) {
		debug("exists-x-i", step, part, steps);
		if (part != null)
			return "Exists-x-Intro: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

		if (steps == null || steps.length != 1)
			return "Exists-x-Intro: Must reference one prior proof step.";
		
		var refStep = parseInt(steps[0]) - 1;
		if (refStep >= step)
			return "Exists-x-Intro: Referenced step must occur before current step.";
		
		var currStep = proof.steps[step];
		var currExpr = currStep.getSentence();
		var scope = currStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
		var refExpr = proof.steps[refStep].getSentence();
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
		},
		elimination : function(proof, step, part, steps) {
		debug("exists-x-e", step, part, steps);
		if (part != null)
			return "Exists-x-Elim: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

		if (steps.length != 2 || steps[1].split('-').length != 2)
			return "Exists-x-Elim: Must reference one prior proof step, and one range: a, b-c.";
		
		var refStep = parseInt(steps[0]) - 1;
		if (refStep >= step)
			return "Exists-x-Elim: Referenced step must occur before current step.";

		var stepRange = steps[1].split("-");
		stepRange = [parseInt(stepRange[0]) - 1, parseInt(stepRange[1]) - 1];
		if (stepRange[0] >= step || stepRange[1] >= step || stepRange[0] > stepRange[1])
			return "Exists-x-Elim: Referenced proof step range, x-y, must precede current step, and x < y.";
		
		var currStep = proof.steps[step];
		var currExpr = currStep.getSentence();
		var refExpr = proof.steps[refStep].getSentence();
		var startStep = proof.steps[stepRange[0]];
		var startExpr = startStep.getSentence();
		var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
		var endExpr = proof.steps[stepRange[1]].getSentence();
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
		}
	}),	
	"=" : new Rule({
		name : "Equality",
		type : "normal",
		introduction : function(proof, step, part, steps) {
		debug("=i", step, part, steps);
		if (part != null)
			return "Equality-Intro: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

		if (steps != null)
			return "Equality-Intro: Steps reference not applicable.";

		var s = proof.steps[step].getSentence();
		if (s[0] !== '=')
			return "Equality-Intro: Current step is not an equality." + proof.steps[step].getSentence();

		if (semanticEq(s[1], s[2]))
			return true;
		
		return "Equality-Intro: Left and right sides do not match.";
		},
		elimination : function(proof, step, part, steps) {
		debug("=e", step, part, steps);
		if (part != null)
			return "Equality-Elim: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

		if (steps.length != 2)
			return "Equality-Elim: Must reference two, prior proof steps.";

		var substSteps = [parseInt(steps[0]) - 1, parseInt(steps[1]) - 1];
		if (substSteps[0] >= step || substSteps[1] >=  step)
			return "Equality-Elim: Both referenced steps must occur before current step.";
		
		var equalityExpr = proof.steps[substSteps[0]].getSentence();
		var elimExpr = proof.steps[substSteps[1]].getSentence();
		var proposedResult = proof.steps[step].getSentence();
		if (equalityExpr[0] !== '=')
			return "Equality-Elim: First referenced step is not an equality.";
					
		var elimExprT = elimTransform(elimExpr, equalityExpr[1], equalityExpr[2]);
		if (elimExprT === false || !semanticEq(elimExprT, proposedResult))
			return "Equality-Elim: Does not result in current step.";

		return true;
		}
	}),
};
