var foljsVerifier = (function() {
	var debugMode = true;
	var obj = {};
	obj.verifyFromAST = function(ast) {
		var proof = preprocess(ast);
		return obj.verify(proof);
	};

	// proof = { 1 : Rule(), 2 : Rule() ... };
	obj.verify = function(proof) {
		var result = { message : "Proof is valid.", valid : true };
		for (var i=0; i<proof.steps.length; i++) {
			validateRule(result, proof, i);
			if (! result.valid) {
				break;
			}
		}
		return result;
	};

	var validateRule = function validateRule(result, proof, step) {
		var rule = proof.steps[step];
		var why = rule.getJustification();
		var validator = lookupValidator(why);
		if (typeof validator === 'function') {
			var part = why[2], lines = why[3];
			var isValid = validator(proof, step, part, lines);
			if (isValid === true) {
				result.valid = true;
			} else {
				result.valid = false;
				result.message = isValid;
				result.errorStep = step + 1;
				result.errorSrcLoc = rule.getMeta();
			}
			return;
		} else if (typeof validator === "string") {
			result.valid = false;
			result.message = validator;
			result.errorStep = step + 1;
			result.errorSrcLoc = rule.getMeta();
		}
		result.valid = false;
	};

	function lookupValidator(why) {
		var name = why[0].toLowerCase();
		var rule = rules[name];
		if (typeof rule === 'function') { // probably assumption or premise
			return rule;
		} else if (why[1] && typeof rule === 'object') {
			var keys = Object.keys(rule);
			var elimOrIntro = why[1].toLowerCase();
			for (var i=0; i<keys.length; i++) {
				if (keys[i].indexOf(elimOrIntro) === 0) {
					return rule[keys[i]];
				}
			}
			return "Cannot determine elim/intro rule type from " + elimOrIntro;
		}
		return "Unrecognized rule: " + why[0] + " " + (why[1] ? why[1] : "")  + (why[2] ? why[2] : "") + " " + (why[3] ? why[3] : "");
	}

	function preprocess(ast) {
		var proof = { steps : [] };
		preprocessBox(proof, ast, 0);
		return proof;
	}

	function preprocessBox(proof, ast, step) {
		for(var i=0; i<ast.length; i++) {
			if (ast[i][0] === 'rule') {
				proof.steps[step] = new Rule(ast[i][1], ast[i][2], ast[i][3]);
				step = step + 1;
			} else if (ast[i][0] === 'folbox') {
				step = preprocessBox(proof, ast[i][1], step);
			} else if (ast[i][0] === 'box') {
				step = preprocessBox(proof, ast[i][1], step);
			}
		}
		return step;
	}

	var Rule = function(sentenceAST, justificationAST, loc) {
		this.getSentence = function getSentence() {
			return sentenceAST;
		};
		this.getJustification = function getJustification() {
			return justificationAST;
		};
		this.getMeta = function() {  return loc; }
	};

	var rules = {
		"premise" : function(proof, step) { return true; },
		"assumption" : function(proof, step) { return true; },
		"pbc" : function(proof, step, part, steps) {
			debug("PBC", step, part, steps);
			var stepRange = steps ? steps[0].split("-") : null;
			if (steps.length != 1 || stepRange.length != 2)
				return "PBC: Unrecognized step reference format. Should be, e.g., 2-7.";

			stepRange = [parseInt(stepRange[0]) - 1, parseInt(stepRange[1]) - 1];
			if (stepRange[0] >= step || stepRange[1] >= step || stepRange[0] > stepRange[1])
				return "PBC: Referenced proof step range, x-y, must precede current step, and x < y.";

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
		},
		"->" : {
			"introduction" : function(proof, step, part, steps) {	
				console.debug(steps);
				var truthStep = parseInt(steps[1]) - 1, impliesStep = parseInt(steps[0]) - 1;
				if (truthStep >= step || impliesStep >= step)
					return "Referenced proof steps must precede current step.";

				var truth = proof.steps[truthStep].getSentence();
				var implies = proof.steps[impliesStep].getSentence();
				console.debug(implies, truth);
				if (implies[0] != '->')
					return "Line " + steps[0] + " is not an implication";
				var truthSemEq = semanticEq(implies[1], truth);
				var resultSemEq = semanticEq(implies[2], proof.steps[step].getSentence());
				if (truthSemEq) {
					if (resultSemEq) {
						return true;
					} else {
						return "The left side does not imply this result.";
					}
				}

				return "The implication's left side does not match the referenced step.";
			},
			"elimination" : function(proof, step, part, steps) {
				debug("-> e", step, part, steps);
				if (part != null)
					return "Implies-Elim: Step part (e.g., 2 in 'and e2') not applicable, in this context.";

				var truthStep = parseInt(steps[1]) - 1, impliesStep = parseInt(steps[0]) - 1;
				if (truthStep >= step || impliesStep >= step)
					return "Implies-Elim: Referenced proof steps must precede current step.";

				var truth = proof.steps[truthStep].getSentence();
				var implies = proof.steps[impliesStep].getSentence();
				console.debug(implies, truth);
				if (implies[0] != '->')
					return "Line " + steps[0] + " is not an implication";
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
		},
		"and" : {
			"introduction" : function(proof, step, part, steps) {
				return false;
			},
			"elimination" : function(proof, step, part, steps) {
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
		},
		"or" : {
			"introduction" : function(proof, step, part, steps) {
				return false;
			},
			"elimination" : function(proof, step, part, steps) {
				return false;
			}
		},
		"not" : {
			"introduction" : function(proof, step, part, steps) {
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
			"elimination" : function(proof, step, part, steps) {
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
		},
		"A.x" : {
			"introduction" : function(proof, step, part, steps) {
				return false;
			},
			"elimination" : function(proof, step, part, steps) {
				return false;
			}
		},
		"E.x" : {
			"introduction" : function(proof, step, part, steps) {
				return false;
			},
			"elimination" : function(proof, step, part, steps) {
				return false;
			}
		},	
		"=" : {
			"introduction" : function(proof, step, part, steps) {
				debug("=i", step, part, steps);
				if (part != null)
					return "Equality-Intro: Step part (e.g., the 2 in 'and e2') not applicable, in this context.";

				var s = proof.steps[step].getSentence();
				if (s[0] !== '=')
					return "Equality-Intro: Current step is not an equality." + proof.steps[step].getSentence();

				if (semanticEq(s[1], s[2]))
					return true;
				
				return "Equality-Intro: Left and right sides do not match.";
			},
			"elimination" : function(proof, step, part, steps) {
				return false;
			}
		},
	};
	function semanticEq(a, b) {
		debug("semanticEq", a, b);
		var binOps = ["->", "and", "or", "<->"];
		var unOps = ["not"];
		if (arrayContains(binOps, a[0]) && a[0] === b[0]) {
			if (semanticEq(a[1], b[1]) && semanticEq(a[2], b[2])) {
				debug("sEq path 1");
				return true;
			}
			debug("sEq path 1.1");
			return false;
		} else if (arrayContains(unOps, a[0]) && a[0] === b[0]) {
			if (semanticEq(a[1], b[1])) {
				debug("sEq path 2");
				return true;
			}
			debug("sEq path 2.1");
			return false;
		} else if (a[0] === "id") {
			if (a[1] !== b[1]) return false;
			if (a.length == 2 && b.length == 2) {
				debug("sEq path 3");
				return true;
			}

			if (a.length == 3 && b.length == 3) {
				if (a[2].length != b[2].length) {
					debug("sEq path 3.1");
					return false;
				}
				for (var i=0; i<a[2].length; i++) {
					if (!semanticEq(a[2][i], b[2][i])) {
						debug("sEq path 3.2");
						return false;
					}
				}
				debug("sEq path 3.3");
				return true;
			}
		}
		debug("sEq path 4");
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

	function debug() {
		if (debugMode)
			console.log.apply(console, Array.prototype.slice.call(arguments));
	}
	return obj;
})();
