///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../verifier/Verifiers" />
///<reference path="../verifier/ProofFactory/ProofFactory" />

import { PLVerifier } from "../verifier/Verifiers";
import { ProofFactory } from "../verifier/ProofFactory/ProofFactory";
import { FOL, PL } from "../parsers/Parsers";
import fs = require('fs');
import path = require('path');
import nomnom = require('nomnom');
var pkg = require('../../package.json');

class Program {
	public main(opts:any = this.parseCmdLine()): void {
		if (opts.file) {
        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8');
        var ast, proof, result;
        //try {
       		ast = new FOL.Parser().parse(raw);
					if (opts['show-ast'])
						console.log(JSON.stringify(ast, null, 2));
					proof = new ProofFactory().preprocess(ast);
					if (opts['show-ir'])
						console.log(JSON.stringify(proof, null, 2))
        	result = new PLVerifier().Verify(proof);
        /*} catch(ex) {
        	console.log(JSON.stringify(ast, null, 2));
        	console.log("ERROR", ex.toString());
        }*/
    }
	}

	public parseCmdLine(): any {
		return nomnom
			.script('LitLog')
			.option('file', {
				flag: true,
				position: 0,
				help: '.fol source file'
			})
			.option('show-ast', {
				flag: true,
				help: "(DEBUG): Show the Abstract Syntax Tree returned by the parser."
			})
			.option('show-ir', {
				flag: true,
				help: "(DEBUG): Show the intermediate representation of the proof."
			})
		  .option('version', {
				flag: true,
				help: 'Print version and exit',
				callback: () => "Version " + pkg.version
			})
			.parse();
	}
}

export { Program }
