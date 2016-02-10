///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["PBC can be valid."] = (test: Test) => {
	var src = "a -> b\na\n| ~b\n| b: -> elim 1,2\n| _|_: not elim 3,4\nb: PBC 3-5";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["PBC not valid when assumption not negation."] = (test: Test) => {
	var src = "a -> ~b\na\n| b\n| ~b: -> elim 1,2\n| _|_: not elim 3,4\n~b: PBC 3-5";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["PBC not valid when last step in range not contradiction."] = (test: Test) => {
	var src = "a -> ~b\na\n| b\n| ~b: -> elim 1,2\n~b: PBC 3-4";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["PBC not valid when result not negation of assumption."] = (test: Test) => {
	var src = "a -> b\na\n| ~b\n| b: -> elim 1,2\n| _|_: not elim 3,4\n~b: PBC 3-5";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

var PLPBCRule = group;
export { PLPBCRule }
