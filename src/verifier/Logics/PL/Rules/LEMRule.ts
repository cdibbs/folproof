///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class LEMRule extends RuleBase {
    public get Name(): string { return "LEM"; }
    public get Type(): string { return "derived"; }
    private format: IReasonFormat = new ReasonFormat(false, null, false);
    public ReasonFormat(type: string): IReasonFormat { return this.format; }
            
    public Exec(proof: IProof, step: number): IVerificationResult {
        var s = proof.Steps[step].Expression;
        if (s[0] !== "or")
            return new InvalidResult("LEM: must be of the form phi or not phi.");
            
        var left = s[1], right = s[2];
        if (right[0] !== "not" || !this.semanticEq(left, right[1]))
            return new InvalidResult("LEM: right side must be negation of left.");

        return new ValidResult();
    }
}

export { LEMRule }