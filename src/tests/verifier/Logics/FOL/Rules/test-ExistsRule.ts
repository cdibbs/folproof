///<reference path="../../../../../../typings/tsd.d.ts"/>
import base = require('./baseTestLogic');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["Exists introduction succeeds when referenced step matches after substitution."] = (test: Test) => {
	var src = "P(a)\nE.x P(x) : E.x/a intro 1";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Exists introduction fails when referenced step doesn't match after substitution."] = (test: Test) => {
	var src = "P(a)\nE.x Q(x) : E.x/a intro 1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);

	src = "P(a)\nE.y P(y) : E.x/a intro 1";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Exists elimination succeeds when referenced step range is assumption & concl. matches current step."] = (test: Test) => {
	var src = "E.a P(a)\n| with x0\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\n| E.a(P(a) or Q(a)) : E.a/x0 i 3\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-4";
	var result = base.verifyProof(src);
	test.ok(result.Valid, result.Message);
	test.done();
}

group["Exists elimination fails when referenced step range is not assumption."] = (test: Test) => {
	var src = "E.a P(a)\nE.a P(a) or Q(a)\n : or i1 2\nE.a P(a) or Q(a) : E.x/a elim 1,2-2";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Exists elimination fails when referenced step range is not scoping assumption."] = (test: Test) => {
	var src = "E.a P(a)\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\n| E.a(P(a) or Q(a)) : E.a/x0 i 3\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-4";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.done();
}

group["Exists elimination fails when assumption conclusion doesn't match current step."] = (test: Test) => {
	var src = "E.a P(a)\n| with x0\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-3";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.ok(result.Message.indexOf("ending step") >= 0, "Must fail because ending step.");
	test.done();
}

group["Exists elimination fails when assumption start doesn't match first exists ref step."] = (test: Test) => {
	var src = "E.a Q(a)\n| with x0\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-3";
	var result = base.verifyProof(src);
	test.ok(!result.Valid, result.Message);
	test.ok(result.Message.indexOf("beginning step") >= 0, "Must fail because beginning step doesn't match exists step.");
	test.done();
}

var FOLExistsRule = group;
export { FOLExistsRule };
