///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Substitution (= elim) works for unbound vars."] = (test: Test) => {
	var src = "a -> A.a(a -> c) -> b\n"
				  + "a = x\n"
					+ "x -> A.a(a -> c) -> b : = e 2,1\n";

	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Substitution (= elim) fails for bound vars."] = (test: Test) => {
	var src = "a -> A.a(a -> c) -> b\n"
				  + "a = x\n"
					+ "x -> A.a(x -> c) -> b : = e 2,1\n";

	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Substitution (= elim) works for any # of unbound vars."] = (test: Test) => {
	var src = "a -> A.a(a -> c) -> b or a and a \n"
				  + "a = x\n"
					+ "x -> A.a(a -> c) -> b or a and x : = e 2,1\n";

	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

var FOLSubstitutionRule = group;
export { FOLSubstitutionRule }
