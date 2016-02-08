///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Or elimination succeeds when assumptions produce same result."] = (test: Test) => {
	var src = "a or b\n~a\n~b\n| a : assumption\n| _|_ : not e 2,4\n---\n"
					+ "| b : assumption\n| _|_ : not e 3,6\n_|_ : or e 1,4-5,6-7";
  var proof = base.fetchProof(src);
  console.log(proof.toString());
  var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Or elimination fails when assumptions don't begin with or side."] = (test: Test) => {
	var src = "a or b\n~a\n~b\n| c : assumption\n---\n"
					+ "| c : assumption\nc : or e 1,4-4,5-5";
  var result = base.verifyProof(src);
  test.ok(!result.Valid, result.Message);
	test.done();
}

group["Or elimination fails when assumptions don't produce same result."] = (test: Test) => {
	var src = "a or b\n~a\n~b\n| a : assumption\n| _|_ : not e 2,4\n---\n"
					+ "| b : assumption\n| _|_ : not e 3,6\n| c : contra e 6\n_|_ : or e 1,4-5,6-8";
  var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Or introduction succeeds when side matches reference."] = (test: Test) => {
	var src = "a\na or b : or i1 1";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);

	src = "a\nb or a : or i2 1";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Or introduction fails when side does not match reference."] = (test: Test) => {
	var src = "~a\na or b : or i1 1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);

	src = "~a\nb or a : or i2 1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

var PLOrRule = group;
export { PLOrRule }
