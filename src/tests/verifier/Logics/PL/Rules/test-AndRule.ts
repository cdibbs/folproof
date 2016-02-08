///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["And introduction fails when reference is not a tautology."] = (test: Test) => {
	var src = "a\n~b\na and b : and i 1,2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);

  src = "~a\nb\na and b : and i 1,2";
	result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
};

group["And introduction succeeds when references are tautologies."] = (test: Test) => {
	var src = "a\nb\na and b : and i 1,2";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
};

group["And elimination fails when reference side doesn't match current step."] = (test: Test) => {
	var src = "a and b\nb : and e1 1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);

	src = "a and b\na : and e2 1";
	result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
};

group["And elimination succeeds when reference side matches current step."] = (test: Test) => {
	var src = "a and b\na : and e1 1";

	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);

	src = "a and b\nb : and e2 1";
	result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
};

var PLAndRule = group;
export { PLAndRule }
