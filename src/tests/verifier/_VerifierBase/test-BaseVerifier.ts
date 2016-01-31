///<reference path="../../../../typings/tsd.d.ts"/>
import { BaseVerifier } from "../../../verifier/_VerifierBase/BaseVerifier";

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["BaseVerifier doesn't permit step references to reach deeper scopes."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    var v = new BaseVerifier();
    v.
    test.ok(j.hasLineReferences);
    test.done();
};

var JustificationTests = group;
export { JustificationTests }
