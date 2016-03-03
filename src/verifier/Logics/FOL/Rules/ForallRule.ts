///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { FOLRuleBase } from "../FOLRuleBase";

class ForallRule extends FOLRuleBase {
  public get Name(): string { return "Forall"; }
  public get Type(): string { return "normal"; }
  private introFormat: IReasonFormat = new ReasonFormat(false, ["range"], true);
  private elimFormat: IReasonFormat = new ReasonFormat(true, ["num", "range"], true);
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
    var currStep = proof.steps[step];
    var currExpr = currStep.getSentence();
    var startStep = proof.steps[steps[0][0]];
    var startExpr = startStep.getSentence();
    var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
    var endExpr = proof.steps[steps[0][1]].getSentence();
    if (currExpr[0] !== 'forall')
      return "All-x-Intro: Current step is not a 'for-all' expression.";
    if (scope.length == 0 || scope[0] == null)
      return "All-x-Intro: Not valid without a scoping assumption (e.g., an x0 box).";

    // check if any substitutions from our scope match refExpr
    var scopeVar = scope[scope.length-1];
    var found = scope.slice().reverse().reduce(function(a,e) { return a && (e == null || e == subst[1]); }, true);
    if (! found)
      return "All-x-intro: Substitution " + subst[1] + " doesn't match scope: " + scope.filter(function(e) { if (e != null) return e; }).join(", ");

    var endExprSub = substitute(endExpr, subst[1], subst[0]);
    if (semanticEq(endExprSub, currExpr[2]))
      return true;
    return "All-x-Intro: Last step in range doesn't match current step after " + subst[0] + "/" + subst[1] + ".";
  }

  public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: ISubstitution): IVerificationResult {
    var currStep = proof.steps[step];
		var currExpr = currStep.getSentence();
		var refExpr = proof.steps[steps[0]].getSentence();
		if (refExpr[0] !== 'forall')
			return "All-x-Elim: Referenced step is not a for-all expression.";

		var refExprSub = substitute(refExpr[2], subst[0], subst[1]);
		if (semanticEq(refExprSub, currExpr))
			return true;

		return "All-x-Elim: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + ".";
  }
}

export { ForallRule };
