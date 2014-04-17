var Verifier = (function() {
	var rules = require("./rules");
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
			validateStatement(result, proof, i);
			if (! result.valid) {
				break;
			}
		}
		return result;
	};

	var validateStatement = function validateStatement(result, proof, step) {
		var stmt = proof.steps[step];
		var why = stmt.getJustification();
		var newv = null;
		if (why[0].split('.').length == 2)
			newv = why[0].split('.')[1];
		var validator = lookupValidator(why);
		if (typeof validator === 'function') {
			var part = why[2], lines = why[3];
			var isValid = validator(proof, step, part, lines, newv);
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

	function lookupValidator(why) {
		var name = why[0].toLowerCase();
		if (name.split('.').length == 2)
			name = name.split('.')[0] + ".";
		var rule = rules[name];
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

	function preprocess(ast) {
		var proof = { steps : [] };
		preprocessBox(proof, ast, 0, []);
		return proof;
	}

	function preprocessBox(proof, ast, step, scope) {
		for(var i=0; i<ast.length; i++) {
			if (ast[i][0] === 'rule') {
				proof.steps[step] = new Statement(ast[i][1], ast[i][2], scope, ast[i][3]);
				step = step + 1;
			} else if (ast[i][0] === 'folbox') {
				var newScope = scope.slice(0)
				newScope.push([ast[i][2][1], ast[i][2][2]]);
				step = preprocessBox(proof, ast[i][1], step, newScope);
			} else if (ast[i][0] === 'box') {
				step = preprocessBox(proof, ast[i][1], step, scope);
			}
		}
		return step;
	}

	var Statement = function(sentenceAST, justificationAST, scope, loc) {
		this.getSentence = function getSentence() {
			return sentenceAST;
		};
		this.getScope = function getScope() {
			return scope;
		}
		this.getJustification = function getJustification() {
			return justificationAST;
		};
		this.getMeta = function() { return loc; }
	};

	function substitute(startExpr, a, b, bound) {
		debug("substitute", startExpr, a, b);
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
		debug("elimTransform", startExpr, origSubExpr, newSubExpr);
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
		debug("semanticEq", a, b);
		var binOps = ["->", "and", "or", "<->", "="];
		var unOps = ["not"];
		// remove parens, which are basically stylistic no-ops
		while (a[0] === 'paren') a = a[1];
		while (b[0] === 'paren') b = b[1];

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
		} else if (a[0] === 'exists' || a[0] === 'forall' && a[0] === b[0]) {
			if (semanticEq(a[2], b[2])) {
				debug("sEq path 2.5");
				return true;
			}
			debug("sEq path 2.6");
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

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.Verifier = Verifier;
}
