///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Implication introduction succeeds when left and right side match first and last step of assumption."] = (test: Test) => {
	var src = "|a : assumption\n|a or b : or i1 1\na -> (a or b) : -> i 1-2";
  var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Implication introduction fails when left or right side don't match beginning or end of assumption."] = (test: Test) => {
	var src = "|a : assumption\n|a or b : or i1 1\nb -> (a or b) : -> i 1-2";
  var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);

	src = "|a : assumption\n|a or c : or i1 1\na -> (a or b) : -> i 1-2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Implication elimination succeeds when left side matches 2nd ref step, and right side matches current step."] = (test: Test) => {
	var src = "a -> b\na\nb : -> e 1,2";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Implication elimination fails when left side doesn't match 2nd ref step."] = (test: Test) => {
	var src = "a -> b\nc\nb : -> e 1,2";
  var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Implication elimination fails when right side doesn't match current step."] = (test: Test) => {
	var src = "a -> b\na\nc : -> e 1,2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

var PLImplicationRule = group;
export { PLImplicationRule }
