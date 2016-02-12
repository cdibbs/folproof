///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class ForallRule extends RuleBase {
  public get Name(): string { return "Forall"; }
  public get Type(): string { return "normal"; }
  private introFormat: IReasonFormat = new ReasonFormat(false, ["num"], true);
  private elimFormat: IReasonFormat = new ReasonFormat(true, ["num", "range"], true);
  public ReasonFormat(type: string): IReasonFormat {
      if (type === "intro") return this.introFormat;
      if (type === "elim") return this.elimFormat;
      throw new Error(`Unknown ${this.Name} variation ${type}.`);
  }

  public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: string[]): IVerificationResult {
    var type = proof.Steps[step].Justification.ruleType;
    var stepRefsZeroBase = stepRefs.map(function(r) { return r.map(function(r2) { return r2 - 1; })});
    if (type === "intro") return this.IntroVerifier(proof, step, partRef, stepRefsZeroBase);
    if (type === "elim") return this.ElimVerifier(proof, step, partRef, stepRefsZeroBase);

    throw new Error(`Unknown ${this.Name} variation ${type}.`);
  }

  public IntroVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: string[]): IVerificationResult {
    return new InvalidResult("Not implemented.");
  }

  public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: string[]): IVerificationResult {
    return new InvalidResult("Not implemented.");
  }
}

export { ForallRule };
