var parser = require("../folproof-parser.js").parser;
var fs = require('fs');
var path = require('path');

// look for .folproof files in this directory and add a test for each one
if (typeof path.sep === "undefined") path.sep = "/";
var srcTests = {};
var baseDir = path.sep + "case-studies" + path.sep;
var srcs = fs.readdirSync(__dirname + baseDir)
  .filter(function(filename) { return /.folproof$/.test(filename); });

for (var i=0, l=srcs.length; i<l; i++) {
  srcTests["File " + srcs[i] + " parses, correctly."] = (function(path) {
    return function(test) {
      var src = fs.readFileSync(path, "utf8");
      test.ok(parser.parse(src));
			test.done();
    };
  })(__dirname + baseDir + srcs[i]);
}

module.exports = srcTests;
