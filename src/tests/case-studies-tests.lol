///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parser/Parser.d.ts" />
///<reference path="../verifier/_VerifierBase/BaseVerifier.ts"/>

import {Test, ITestGroup} from 'nodeunit';
import {Parser} from "../parser/parser";
import {BaseVerifier} from "../verifier/_VerifierBase/BaseVerifier";
import FS = require('fs');
import Path = require('path');

var testGroup: ITestGroup = {
  setUp: (callback) => { callback(); },
  tearDown: (callback) => { callback(); }
};

// look for .folproof files in this directory and add a test for each one
var srcTests = {};
var caseStudiesPath = Path.join(__dirname, "../../tests/case-studies");
var srcs = FS
  .readdirSync(caseStudiesPath)
  .filter((filename) => /.folproof$/.test(filename));

testGroup['Test Case study files are found'] = (test: Test) => {
  test.ok(srcs.length);
  test.done();
}

for (var i=0, l=srcs.length; i<l; i++) {
  var path = Path.join(caseStudiesPath, srcs[i]);
  ((path) => {
    testGroup[`Test File ${srcs[i]} parses and validates.`]
    = (test: Test) => {
      // Setup
      var src = FS.readFileSync(path, "utf8");
      var verifier = new BaseVerifier();
      var parser = new Parser();

      // Test
			var ast = parser.parse(src);

      // Assert
      test.ok(ast);
      test.ok(verifier.VerifyFromAST(ast).Valid);
			test.done();
    };
  })(path);
}
console.log("WHAT!");
export { testGroup };
