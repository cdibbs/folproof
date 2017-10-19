#!/usr/bin/env node

/*require('typescript-require')({
    nodeLib: false,
    targetES5: true,
    moduleKind: 'AMD',
    exitOnError: true
});*/
var parse	= require('../dist/parsers/Parsers').FOL.parse;
var FOLVerifier = require('../dist/verifier/Verifiers').FOLVerifier;
var ProofFactory = require('../dist/verifier/ProofFactory/ProofFactory').ProofFactory;
var fs = require('fs');
var path = require('path');
console.log(FOLVerifier, parse);
var version = require('../package.json').version;

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
		// should have language identifier routines, too. That and these should be
		// bundled into something simpler... this should all be typescript code. cli.js
		// should be minimal. Heavy refactoring needed.
		var verifier = new FOLVerifier();
		var proofFactory = new ProofFactory();

        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8');
        var ast, result;
        //try {
       		ast = parse(raw);
        	result = verifier.Verify(proofFactory.preprocess(ast));
		console.log(result);
        //} catch(ex) {
        	//console.log(JSON.stringify(ast, null, 2));
        	//console.log("ERROR", ex.toString());
        //}
    }
};

if (require.main === module)
	exports.main();
