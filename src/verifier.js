var rules = require("./rules");
var u = require("./util");

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

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.Verifier = Verifier;
}
