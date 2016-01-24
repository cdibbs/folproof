///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class DoubleNegationRule extends RuleBase {
    public get Name(): string { return "DoubleNegation"; }
    public get Type(): string { return "derived"; }
    private elimFormat: IReasonFormat = new ReasonFormat(false, ["num", "num"], false);
    private introFormat: IReasonFormat = new ReasonFormat(true, ["num"], false);
    public ReasonFormat(type: string): IReasonFormat {
        if (type === "intro") throw new Error("Double-negation doesn't have an intro rule.");
        if (type === "elim") return this.elimFormat;
        throw new Error(`Unknown ${this.Name} variation ${type}.`);
    }
            
    public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var type = proof.Steps[step].Justification.ruleType;
        if (type === "intro") return new InvalidResult("Double-negation doesn't have an intro rule.");
        if (type === "elim") return this.ElimVerifier(proof, step, partRef, stepRefs);
        
        throw new Error(`Unknown ${this.Name} variation ${type}.`);
    }
    
    public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var curStep = proof.Steps[step].Expression;
        var refStep = proof.Steps[stepRefs[0][0]].Expression;
        if (refStep[0] !== 'not' || refStep[1][0] !== 'not')
            return new InvalidResult("Notnot-elim: Referenced step is not a double-negation.");

        if (!this.semanticEq(refStep[1][1], curStep))
            return new InvalidResult("Notnot-elim: Does not result in current step.");

        return new ValidResult();
    }
}

export { DoubleNegationRule }