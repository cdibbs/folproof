///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parser/parser" />
///<reference path="../verifier/Verifiers" />

import { FOLVerifier } from "../verifier/Verifiers";
import { Parser } from "../parser/parser";
import fs = require('fs');
import path = require('path');
import nomnom = require('nomnom');
var pkg = require('../package.json');

var opts = nomnom
	.script('folproof')
	.option('file', {
		flag: true,
		position: 0,
		help: '.fol source file'
	})
  .option('version')
	.parse();

exports.main = function() {
    if (opts.file) {
        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8');
        var ast, result;
        //try {
       		ast = parser.parse(raw);
        	result = verifier.VerifyFromAST(ast);
		console.log(result);
        //} catch(ex) {
        	//console.log(JSON.stringify(ast, null, 2));
        	console.log("ERROR", ex.toString());
        //}
    }
};

if (require.main === module)
	exports.main();
