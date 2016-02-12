///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class ExistsRule extends RuleBase {
  public get Name(): string { return "Exists"; }
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
    var currStep = proof.Steps[step];
    var currExpr = currStep.Expression;
    var refExpr = proof.Steps[steps[0]].Expression;
    if (currExpr[0] !== 'exists')
        return new InvalidResult("Exists-x-Intro: Current step is not an 'exists' expression.");

    var refExprSub = this.substitute(refExpr, subst[1], subst[0]);
    if (this.semanticEq(refExprSub, currExpr[2]))
        return new ValidResult();

    return new InvalidResult("Exists-x-Intro: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + " substitution.");

  }

  public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: string[]): IVerificationResult {
    var currStep = proof.Steps[step];
    var currExpr = currStep.Expression;
    var refExpr = proof.Steps[stepRefs[0][0]].Expression;
    var startStep = proof.Steps[stepRefs[1][0]];
    var startExpr = startStep.Expression;
    var endExpr = proof.Steps[stepRefs[1][1]].Expression;
    if (refExpr[0] !== 'exists')
        return new InvalidResult("Exists-x-Elim: Referenced step is not an 'exists' expression.");
    if (scope.depth == 0)
        return new InvalidResult("Exists-x-Elim: Range must be within an assumption scope (e.g., an x0 box).");

    // check whether substition matches ref line with current line
    var scopeVars = startStep.Scope.variable;
    var refExprSub = this.substitute(refExpr[2], subst[0], subst[1]);
    if (this.semanticEq(refExprSub, startExpr)) {
        if (this.semanticEq(endExpr, currExpr))
            return new ValidResult();
        return new InvalidResult("Exists-x-Elim: assumption ending step does not match current step.");
    }
    return new InvalidResult("Exists-x-Elim: assumption beginning step doesn't match ref step for " + scopeVars[0] + ".");
  }
}

export { ExistsRule }
