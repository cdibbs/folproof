///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["_|_ elimination fails when reference line not contradiction."] = (test: Test) => {
	var src = "c\na -> b : contra e 1\n";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["_|_ elimination succeeds when reference line is contradiction."] = (test: Test) => {
	var src = "_|_\na -> b : contra e 1\n";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

var PLContradictionRule = group;
export { PLContradictionRule }
