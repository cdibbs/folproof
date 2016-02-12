///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Forall elimination fails when referenced step doesn't match."] = (test: Test) => {
	var src = "A.x P(x)\nQ(a) : A.x/a elim 1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Forall introduction succeeds when ref is assumption and final step matches current step, under subst."] = (test: Test) => {
	var src = "| with x0\n| P(x0) : assumption\nA.x P(x) : A.x/x0 i 1-1";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Forall introduction fails when reference range is not an assumption."] = (test: Test) => {
	var src = "P(x) : premise\nA.x P(x) : A.x/x i 1-1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.ok(result.Message.indexOf("without a scoping assumption") >= 0, "Error must be because of missing assumption");
	test.done();
}

group["Forall introduction fails when reference range is not a scoping assumption."] = (test: Test) => {
	var src = "| P(x) : assumption\nA.x P(x) : A.x/x i 1-1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.ok(result.Message.indexOf("without a scoping assumption") >= 0, "Error must be because of missing assumption");
	test.done();
}

group["Forall introduction fails when reference range ending step doesn't match current step under subst."] = (test: Test) => {
	var src = "| with x0\n| P(x0) : assumption\nA.x Q(x) : A.x/x0 i 1-1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.ok(result.Message.indexOf("Last step in range") >= 0, "Error must be because of last step mismatch");
	test.done();
}

var FOLForallRule = group;
export { FOLForallRule }
