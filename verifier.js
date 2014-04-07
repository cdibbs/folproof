var foljsVerifier = (function() {
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
		"->" : {
			"introduction" : function(proof, step, part, steps) {
				
			},
			"elimination" : function(proof, step, part, steps) {
				console.log(steps);
				var truthStep = parseInt(steps[1]) - 1, impliesStep = parseInt(steps[0]) - 1;
				var truth = proof.steps[truthStep].getSentence();
				var implies = proof.steps[impliesStep].getSentence();
				console.log(implies, truth);
				if (implies[0] != '->')
					return "Line " + steps[0] + " is not an implication";
				var truthSemEq = semanticEq(implies[0][1], truth);
				var resultSemEq = semanticEq(implies[0][2], proof.steps[step].getSentence());
				if (truthSemEq) {
					if (resultSemEq) {
						return true;
					} else {
						return "The left side does not imply this result.";
					}
				} else {
					return "The implication's left side does not match the referenced step.";
				}
			}
		},
		"and" : {
			"introduction" : {
			},
			"elimination" : {
			}
		},
		"or" : {
			"introduction" : {
			},
			"elimination" : {
			}
		},
		"not" : {
			"introduction" : {
			},
			"elimination" : {
			}
		},
		"A.x" : {
			"introduction" : {
			},
			"elimination" : {
			}
		},
		"E.x" : {
			"introduction" : {
			},
			"elimination" : {
			}
		},	
		"=" : {
			"introduction" : {
			},
			"elimination" : {
			}
		},
	};
	function semanticEq(a, b) {
		console.log("wholesome", a, b);
		var binOps = ["->", "and", "or", "<->"];
		var unOps = ["not"];
		if (arrayContains(binOps, a[0]) && a[0] === b[0]) {
			if (semanticEq(a[1], b[1]) && semanticEq(a[2], b[2])) {
				return true;
			}
			return false;
		} else if (arrayContains(unOps, a[0]) && a[0] === b[0]) {
			if (semanticEq(a[1], b[1])) {
				return true;
			}
			return false;
		} else if (a[0] === "id") {
			if (a[1] !== b[1]) return false;

			if (a.length == 3 && b.length == 3) {
				if (a[2].length != b[2].length) return false;
				for (var i=0; i<a[2].length; i++) {
					if (!semanticEq(a[2][i], b[2][i])) return false;
				}
				return true;
			}
			return false;
		}
	}

	function arrayContains(arr, el) {
		for (var i=0; i<arr.length; i++) {
			if (arr[i] === el) return true;
		}
		return false;
	}
	return obj;
})();
