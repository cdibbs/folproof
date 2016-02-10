///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Premise can be valid."] = (test: Test) => {
	var src = "a: premise";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Premise not valid in assumption scope."] = (test: Test) => {
	var src = "| a: premise";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
  test.done();
}

var PLPremiseRule = group;
export { PLPremiseRule }
