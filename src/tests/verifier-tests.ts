///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../verifier/_VerifierBase/BaseVerifier" />
///<reference path="../verifier/_VerifierBase/IRulebookFactory" />
///<reference path="../verifier/Utilities" />
///<reference path='../verifier/_VerifierBase/Rule.ts' />
///<reference path='../verifier/_VerifierBase/Justifier.ts' />

import { BaseVerifier } from "../verifier/_VerifierBase/BaseVerifier";
import { Rule } from "../verifier/_VerifierBase/Rule";
import { Justifier } from "../verifier/_VerifierBase/Justifier";
import {Test, ITestGroup} from 'nodeunit';

// Setup test group and mocks...
var testGroup: ITestGroup = {
  setUp: (callback) => { callback(); },
  tearDown: (callback) => { callback(); }
};

class MockRulebookFactory implements IRulebookFactory {
	BuildRulebook(): { [id: string] : IRule } {
		return this.rules;
	}

	private rules: { [id: string] : IRule } =
	{
		"premise" : <Rule> {
				Name : "Premise",
				Type : "simple",
				SimpleVerifier : new Justifier(null,
						(proof, step):any => { return true; })
		},
		"assumption" : <Rule> {
				Name : "Assumption",
				Type : "simple",
				SimpleVerifier : new Justifier(null,
				(proof, step):any => {
								if (proof.steps[step].isFirstStmt())
										return true;
								return "Assumptions can only be made at the start of an assumption box.";
						})
				}
		}
}

class MockUtility implements IUtility {
	debugMode:boolean;
	public debug(...args: any[]): void {}
}

console.log(new MockUtility().debug);

testGroup["Preprocess - Sets first/last statements"] = (test: Test) => {
	var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
	var proofAST = [['rule', null, null, null], ['box', [['rule'], ['rule'], ['rule']], null]];
	var proof = v.Preprocess(proofAST);
	test.ok(proof.Steps[0].isFirstStmt, "First step of proof should be marked first.");
	test.ok(!proof.Steps[0].isLastStmt, "First step of proof is not last.");
	test.ok(proof.Steps[1].isFirstStmt, "Second step of proof should, again, be marked first.");
	test.equal(proof.Steps[1].Scope[0], null, "Second step of proof should have null scope.");
	test.ok(!(proof.Steps[2].isFirstStmt || proof.Steps[2].isLastStmt), "Third step is neither first nor last.");
	test.ok(proof.Steps[3].isLastStmt, "Fourth step is last.");
	test.ok(!proof.Steps[3].isFirstStmt, "Fourth step is not first.");
	proofAST = [['rule', null, null, null], ['box', [['rule']], null]];
	proof = v.Preprocess(proofAST);
	test.ok(proof.Steps[1].isFirstStmt && proof.Steps[1].isLastStmt, "Second step is both the first and last step of the assumption.");
	test.done();
};

testGroup["verifyFromAST - Syntax errors result in invalid proofs"] = function(test: Test) {
	var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
	var proofAST = [['rule', ['id', 'a'], ['premise'], null], ['box', [['rule', ['id', 'b'], ['assumption'], null], ['error']], null] ];
	var result = v.VerifyFromAST(proofAST);
	test.ok(! result.Valid, "Proof should be invalid when syntax errors exist.");
	test.done();
};

testGroup["verifyFromAST - Proofs can be valid"] = function(test: Test) {
	var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
	var proofAST = [['rule', ['id', 'a'], ['premise'], null], ['box', [['rule', ['id', 'b'], ['assumption'], null]], null] ];
	var result = v.VerifyFromAST(proofAST);
	console.log(result);
	test.ok(result.Valid, "A proof with only premises and assumptions should be valid.");
	test.done();
};

export { testGroup }
