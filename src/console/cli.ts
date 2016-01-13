///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parser/parser" />
///<reference path="../verifier/Verifiers" />
///<reference path="../verifier/ProofFactory/ProofFactory" />

import { FOLVerifier } from "../verifier/Verifiers";
import { ProofFactory } from "../verifier/ProofFactory/ProofFactory";
import { Parser } from "../parser/parser";
import fs = require('fs');
import path = require('path');
import nomnom = require('nomnom');
var pkg = require('../package.json');

var opts = nomnom()
	.script('LitLog')
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
        var ast, proof, result;
        //try {
       		ast = new Parser().parse(raw);
					proof = new ProofFactory().preprocess(ast);
        	result = new FOLVerifier().Verify(proof);
		console.log(result);
        //} catch(ex) {
        	//console.log(JSON.stringify(ast, null, 2));
        	console.log("ERROR", ex.toString());
        //}
    }
};

if (require.main === module)
	exports.main();
