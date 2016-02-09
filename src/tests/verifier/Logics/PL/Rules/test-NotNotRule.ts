///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["notnot elimination fails when reference line not a double-negation."] = (test: Test) => {
	var src = "~c\nc : notnot e 1\n";
	var result = base.verifyProof(src);
	test.ok(!result.Valid);
	test.done();
}

group["notnot elimination succeeds when reference line double-negation of current line."] = (test: Test) => {
	var src = "~~c\nc : notnot e 1\n";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

var PLNotNot = group;
export { PLNotNot }
