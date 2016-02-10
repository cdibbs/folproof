///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class PremiseRule extends RuleBase {
    public get Name(): string { return "Premise"; }
    public get Type(): string { return "simple"; }
    private format: IReasonFormat = new ReasonFormat(false, null, false);
    public ReasonFormat(type: string): IReasonFormat { return this.format; }

    public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
      var s = proof.Steps[step];
      if (s.Scope.depth > 0)
        return new InvalidResult("Why put a premise in an assumption scope? Did you mean to create a new assumption?");

      return new ValidResult();
    }
}

export { PremiseRule }
