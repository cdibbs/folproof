///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["LEM works."] = (test: Test) => {
	var src = "(a -> b) or not (a -> b) : LEM";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["LEM fails when not in form: phi or not phi."] = (test: Test) => {
	var src = "(a -> b) or (a -> b) : LEM";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

var PLLEMRule = group;
export { PLLEMRule }
