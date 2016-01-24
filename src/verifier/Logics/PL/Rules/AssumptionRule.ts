///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../_VerifierBase/IReasonFormat.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class AssumptionRule extends RuleBase {
    public get Name(): string { return "Assumption"; }
    public get Type(): string { return "simple"; }
    private format: IReasonFormat = new ReasonFormat(false, null, false);
    public ReasonFormat(): IReasonFormat { return this.format; }
            
    public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        if (! proof.Steps[step].isFirstStmt)
            return new InvalidResult("Assumptions can only be made at the start of an assumption box.");
            
        return new ValidResult();
    }
}

export { AssumptionRule }