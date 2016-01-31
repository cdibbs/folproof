///<reference path="../../../typings/tsd.d.ts"/>
import { PLVerifier } from "../../verifier/Verifiers";
import { ProofFactory } from "../../verifier/ProofFactory/ProofFactory";
import { PL } from "../../parsers/parsers";
import FS = require('fs');
import Path = require('path');

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

var srcTests = {};
var caseStudiesPath = Path.join(__dirname, "../../../src/tests/case-studies/PL");
var srcs = FS
    .readdirSync(caseStudiesPath)
    .filter(function (filename) { return /.proof$/.test(filename); });
group['Test Case study files are found'] = function (test) {
    test.ok(srcs.length);
    test.done();
};
for (var i = 0, l = srcs.length; i < l; i++) {
    var path = Path.join(caseStudiesPath, srcs[i]);
    (function (path) {
        group[("Test File " + srcs[i] + " parses and validates.")]
            = function (test) {
                // Setup
                var src = FS.readFileSync(path, "utf8");
                var ast = new PL.Parser().parse(src);
                var proof = new ProofFactory().preprocess(ast);
                var result = new PLVerifier().Verify(proof);
                // Assert
                test.ok(ast, "No AST produced.");
                if (path.indexOf("invalid") == -1)
                  test.ok(result.Valid, "Proof should be valid.");
                else
                  test.ok(! result.Valid, "Proof should be invalid.");
                test.done();
            };
    })(path);
}

var PLCaseStudies = group;
export { PLCaseStudies }
