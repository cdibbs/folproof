#!/usr/bin/env node

var parser	= require('./folproof-parser.js').parser;
var verifier = require('./folproof-verifier.js').Verifier;
var fs = require('fs');
var path = require('path');

var version = require('./package.json').version;

var opts = require("nomnom")
	.script('folproof')
	.option('file', {
		flag: true,
		position: 0,
		help: '.fol source file'
	})
	.parse();

exports.main = function() {
    if (opts.file) {
        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8');
        var ast, result;
        try {
       		ast = parser.parse(raw);
        	result = verifier.verifyFromAST(ast);
		console.log(result);
        } catch(ex) {
        	//console.log(JSON.stringify(ast, null, 2));
        	console.log("ERROR", ex.toString());
        }
    }
};

if (require.main === module)
	exports.main();
