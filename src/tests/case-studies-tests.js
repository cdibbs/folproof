///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parser/Parser.d.ts" />
var parser_1 = require("../parser/parser");
var Verifier_1 = require("../verifier/Verifier");
var FS = require('fs');
var Path = require('path');
var testGroup = {
    setUp: function (callback) { callback(); },
    tearDown: function (callback) { callback(); }
};
exports.testGroup = testGroup;
// look for .folproof files in this directory and add a test for each one
var srcTests = {};
var caseStudiesPath = Path.join(__dirname, "../../src/tests/case-studies");
var srcs = FS
    .readdirSync(caseStudiesPath)
    .filter(function (filename) { return /.folproof$/.test(filename); });
testGroup['Test Case study files are found'] = function (test) {
    test.ok(srcs.length);
    test.done();
};
for (var i = 0, l = srcs.length; i < l; i++) {
    var path = Path.join(caseStudiesPath, srcs[i]);
    (function (path) {
        testGroup[("Test File " + srcs[i] + " parses and validates.")]
            = function (test) {
                // Setup
                var src = FS.readFileSync(path, "utf8");
                var verifier = new Verifier_1.Verifier();
                var parser = new parser_1.Parser();
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
