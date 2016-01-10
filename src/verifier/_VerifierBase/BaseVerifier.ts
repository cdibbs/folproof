///<reference path='IRulebookFactory.ts' />
///<reference path='../Utilities.ts' />
///<reference path='VerificationResult.ts' />
///<reference path='../ProofFactory/Proof.ts' />

import { Proof } from "../ProofFactory/Proof";
import { VerificationResult } from "./VerificationResult";

class BaseVerifier {
    public util:IUtility;
    public log:() => void;
    private rulebookFactory: IRulebookFactory;
    private rules:{ [id: string] : IRule };

    constructor(util: IUtility, rulebookFactory: IRulebookFactory)
    {
        this.util = util;
        this.log = util.debug;
        this.rulebookFactory = rulebookFactory;
    }

    public Verify(proof: Proof): VerificationResult {
        this.rules = this.rulebookFactory.BuildRulebook();
        for (var i=0; i<proof.Steps.length; i++) {
            var result = this.ValidateStatement(proof, i);
            if (! result.Valid) {
                break;
            }
        }
        return new VerificationResult(true, "Proof is valid.");
    }

    public ValidateStatement(proof: Proof, step: number):VerificationResult {
        var stmt = proof.Steps[step];
        if (stmt[0] === 'error')
          return new VerificationResult(false, "Proof invalid due to syntax errors.", step + 1);

        var why = stmt.Justification;
        var newv = null;
        if (why[0].split('.').length == 2)
            newv = why[0].split('.')[1];
        var validator = this.LookupValidator(why);
        if (typeof validator === 'function') {
            var part = why[2], lines = why[3];
            var subst = null;
            if (newv && why[4]) subst = [newv, why[4]];
            var isValid = validator(proof, step, part, lines, subst);
            if (isValid === true) {
              return new VerificationResult(true, "Proof valid.");
            }
            return new VerificationResult(false, isValid, step + 1, stmt.Meta);
        } else if (typeof validator === "string") {
          return new VerificationResult(false, validator, step + 1, stmt.Meta);
        }

        throw new Error("Unknown validator type: " + (typeof validator));
    }

    private LookupValidator(why:any) {
        var name = why[0].toLowerCase();
        if (name.split('.').length == 2)
            name = name.split('.')[0] + ".";
        var rule = this.rules[name];
        if (!rule) return "Cannot find rule: " + name;
        if (rule.Type === "simple" || rule.Type === "derived") {
            var fn = rule.SimpleVerifier;
            if (!fn) throw new Error("Not implemented for " + name);
            return fn.exec;
        }

        if (why[1]) {
            var elimOrIntro = why[1].toLowerCase();
            if ("introduction".indexOf(elimOrIntro) === 0) {
                var fn = rule.IntroVerifier;
                if (!fn) throw new Error("Not implemented for " + name);
                return fn.exec;
            } else if ("elimination".indexOf(elimOrIntro) === 0) {
                var fn = rule.ElimVerifier;
                if (!fn) throw new Error("Not implemented for " + name);
                return fn.exec;
            }
            return "Cannot determine elim/intro rule type from " + elimOrIntro;
        }

        return "Unrecognized rule: " + why[0] + " " + (why[1] ? why[1] : "")  + (why[2] ? why[2] : "") + " " + (why[3] ? why[3] : "");
    }
}

export { BaseVerifier };
