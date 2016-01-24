///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class CopyRule extends RuleBase {
    public get Name(): string { return "COPY"; }
    public get Type(): string { return "derived"; }
    private format: IReasonFormat = new ReasonFormat(false, ["num"], false);
    public ReasonFormat(type: string): IReasonFormat { return this.format; }
            
    public Exec(proof: IProof, step: number, partRef: any, stepRefs: number[][]): IVerificationResult {
        var curStep = proof.Steps[step].Expression;
        var refStep = proof.Steps[stepRefs[0][0]].Expression;
        if (! this.semanticEq(curStep, refStep))
            return new InvalidResult("Copy: Current step is not semantically equalivalent to the referenced step.");

        return new ValidResult();
    }
}

export { CopyRule }