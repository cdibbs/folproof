///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parsers/parsers" />
///<reference path="../verifier/Verifiers" />
///<reference path="../verifier/ProofFactory/ProofFactory" />

import { FOLVerifier } from "../verifier/Verifiers";
import { ProofFactory } from "../verifier/ProofFactory/ProofFactory";
import { FOL, PL } from "../parsers/parsers";
import fs = require('fs');
import path = require('path');
import nomnom = require('nomnom');
var pkg = require('../../package.json');

class Program {
	public main(opts: any = this.parseCmdLine()): void {
    if (opts.file) {
        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8');
        var ast, proof, result;
        //try {
       		ast = new FOL.Parser().parse(raw);
					proof = new ProofFactory().preprocess(ast);
        	result = new FOLVerifier().Verify(proof);
		console.log(result);
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
		  .option('version', {
				flag: true,
				help: 'Print version and exit',
				callback: () => "Version " + pkg.version
			})
			.parse();
	}
}

export { Program }
