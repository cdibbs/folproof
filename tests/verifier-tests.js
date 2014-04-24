var v = require("../src/verifier.js").Verifier;

exports["Sets first/last statements"] = function(test) {
	var proofAST = [['rule', null, null, null], ['box', [['rule'], ['rule'], ['rule']], null]];
	var proof = v.preprocess(proofAST);
	test.ok(proof.steps[0].isFirstStmt(), "First step of proof should be marked first.");
	test.ok(!proof.steps[0].isLastStmt(), "First step of proof is not last.");
	test.ok(proof.steps[1].isFirstStmt(), "Second step of proof should, again, be marked first.");
	test.equal(proof.steps[1].getScope()[0], null, "Second step of proof should have null scope.");
	test.ok(!(proof.steps[2].isFirstStmt() || proof.steps[2].isLastStmt()), "Third step is neither first nor last.");
	test.ok(proof.steps[3].isLastStmt(), "Fourth step is last.");
	test.ok(!proof.steps[3].isFirstStmt(), "Fourth step is not first.");
	proofAST = [['rule', null, null, null], ['box', [['rule']], null]];
	proof = v.preprocess(proofAST);
	test.ok(proof.steps[1].isFirstStmt() && proof.steps[1].isLastStmt(), "Second step is both the first and last step of the assumption.");
	test.done();
};

exports["Syntax errors result in invalid proofs"] = function(test) {
	var proofAST = [['rule', ['id', 'a'], ['premise'], null], ['box', [['rule', ['id', 'b'], ['assumption'], null], ['error']], null] ];
	var result = v.verifyFromAST(proofAST);
	test.ok(! result.valid, "Proof should be invalid when syntax errors exist.");
	test.done();
};

exports["Proofs can be valid"] = function(test) {
	var proofAST = [['rule', ['id', 'a'], ['premise'], null], ['box', [['rule', ['id', 'b'], ['assumption'], null]], null] ];
	var result = v.verifyFromAST(proofAST);
	test.ok(result.valid, "Proof should be invalid when syntax errors exist.");
	test.done();
};
