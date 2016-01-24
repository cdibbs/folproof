///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../_VerifierBase/IReasonFormat.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class MTRule extends RuleBase {
    public get Name(): string { return "MT"; }
    public get Type(): string { return "derived"; }
    private format: IReasonFormat = new ReasonFormat(false, ["num", "num"], false);
    public ReasonFormat(): IReasonFormat { return this.format; }
            
    public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var impStep = proof.Steps[stepRefs[0][0]].Expression;
        if (impStep[0] !== "->")
            return new InvalidResult("MT: 1st referenced step must be implication.");
            
        var left = impStep[1], right = impStep[2];
        var negStep = proof.Steps[stepRefs[1][0]].Expression;
        if (negStep[0] !== "not" || !this.semanticEq(negStep[1], right))
            return new InvalidResult("MT: 2nd ref step must be negation of right side of 1st ref step.");

        var s = proof.Steps[step].Expression;
        if (s[0] !== 'not' || !this.semanticEq(left, s[1]))
            return new InvalidResult("MT: current step must be negation of left side of ref step.");

        return new ValidResult();
    }
}

export { MTRule }