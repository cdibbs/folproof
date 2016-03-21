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
    var currStep = proof.Steps[step];
    var currExpr = currStep.Expression;
    var startStep = proof.Steps[stepRefs[0][0]];
    var startExpr = startStep.Expression;
    var scope = startStep.Scope; // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
    var endExpr = proof.Steps[stepRefs[0][1]].Expression;
    if (currExpr[0] !== 'forall')
      return new InvalidResult("All-x-Intro: Current step is not a 'for-all' expression.");
    if (! scope.hasAncestorVariable)
      return new InvalidResult("All-x-Intro: Not valid without a scoping assumption (e.g., an x0 box).");

    // check if any substitutions from our scope match refExpr
    if (! scope.ancestorVariableMatch(subst.Right))
      return new InvalidResult(`All-x-intro: Substitution ${subst.Right} doesn't match scope`);

    var endExprSub = this.substitute(endExpr, subst.Right, subst.Left);
    if (! this.semanticEq(endExprSub, currExpr[2]))
      return new InvalidResult(`All-x-Intro: Last step in range doesn't match current step after ${subst.Left}/${subst.Right} + .`);

    return new ValidResult();
  }

  public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: ISubstitution): IVerificationResult {
    var currStep = proof.Steps[step];
		var currExpr = currStep.Expression;
		var refExpr = proof.Steps[stepRefs[0][0]].Expression;
		if (refExpr[0] !== 'forall')
			return new InvalidResult("All-x-Elim: Referenced step is not a for-all expression.");

		var refExprSub = this.substitute(refExpr[2], subst[0], subst[1]);
		if (! this.semanticEq(refExprSub, currExpr))
		  return new InvalidResult("All-x-Elim: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + ".");

    return new ValidResult();
  }
}

export { ForallRule };
