///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { FOLRuleBase } from "../FOLRuleBase";

class SubstitutionRule extends FOLRuleBase {
  public get Name(): string { return "Substitution"; }
  public get Type(): string { return "normal"; }
  private introFormat: IReasonFormat = new ReasonFormat(false, null, false);
  private elimFormat: IReasonFormat = new ReasonFormat(false, ["num", "num"], false);
  public ReasonFormat(type: string): IReasonFormat {
      if (type === "intro") return this.introFormat;
      if (type === "elim") return this.elimFormat;
      throw new Error(`Unknown ${this.Name} variation ${type}.`);
  }

  public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: ISubstitution): IVerificationResult {
    var type = proof.Steps[step].Justification.ruleType;
    var stepRefsZeroBase = stepRefs.map(function(r) { return r.map(function(r2) { return r2 - 1; })});
    if (type === "intro") return this.IntroVerifier(proof, step, partRef, stepRefsZeroBase, subst);
    if (type === "elim") return this.ElimVerifier(proof, step, partRef, stepRefsZeroBase, subst);

    throw new Error(`Unknown ${this.Name} variation ${type}.`);
  }

  public IntroVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: ISubstitution): IVerificationResult {
    var s = proof.Steps[step].Expression;
    if (s[0] !== '=')
        return new InvalidResult("Equality-Intro: Current step is not an equality.");

    if (! this.semanticEq(s[1], s[2]))
      return new InvalidResult("Equality-Intro: Left and right sides do not match.");

    return new ValidResult();
  }

  public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: ISubstitution): IVerificationResult {
    var equalityExpr = proof.Steps[stepRefs[0][0]].Expression;
    var elimExpr = proof.Steps[stepRefs[1][0]].Expression;
    var proposedResult = proof.Steps[step].Expression;
    if (equalityExpr[0] !== '=')
        return new InvalidResult("Equality-Elim: First referenced step is not an equality.");

    if (!this.semanticEq(elimExpr, proposedResult, equalityExpr[1], equalityExpr[2]))
        return new InvalidResult("Equality-Elim: Does not result in current step.");

    return new ValidResult();
  }
}

export { SubstitutionRule };
