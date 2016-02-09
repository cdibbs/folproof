///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Copy succeeds when reference line is exact match."] = (test: Test) => {
	var src = "a\n|~b : assumption\n|a : copy 1\n~b -> a : -> i 2-3";
  var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
};

group["Copy fails when reference line is not exact match."] = (test: Test) => {
	var src = "a\n|~a : assumption\n|b : copy 1\n~a -> a : -> i 2-3";
  var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
};

var PLCopyRule = group;
export { PLCopyRule }
