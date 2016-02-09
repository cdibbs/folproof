///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Not introduction succeeds when reference is contradiction."] = (test: Test) => {
	var src = "a\n| ~a : assumption\n| _|_ : not e 1,2\n~~a : not i 2-3";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Not introduction fails when reference is not contradiction."] = (test: Test) => {
	var src = "a\n| ~a : assumption\n~~a : not i 2-2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Not elimination succeeds when reference is negation of current step."] = (test: Test) => {
	var src = "a\n~a\n_|_ : not e 1,2";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Not elimination fails when reference is not a negation of current step."] = (test: Test) => {
	var src = "a\n~b\n_|_ : not e 1,2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

var PLNotRule = group;
export { PLNotRule }
