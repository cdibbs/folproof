///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["MT works."] = (test: Test) => {
	var src = "a -> b\n~b\n~a : MT 1,2";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["MT fails when ref 1 not implication."] = (test: Test) => {
	var src = "a and b\n~b\n~a : MT 1,2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["MT fails when ref 2 not negation of right side of ref 1."] = (test: Test) => {
	var src = "a -> b\nb\n~a : MT 1,2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["MT fails when current line not negation of left side of ref 1."] = (test: Test) => {
	var src = "a -> b\n~b\na : MT 1,2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

var PLMTRule = group;
export { PLMTRule }
