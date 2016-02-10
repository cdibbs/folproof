///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Assumptions can be valid."] = (test: Test) => {
	var src = "| a: assumption";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Assumption not valid when not first line in new scope."] = (test: Test) => {
	var src = "a: assumption";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);

  src = "|a: assumption\n|b: assumption";
  result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

var PLAssumptionRule = group;
export { PLAssumptionRule }
