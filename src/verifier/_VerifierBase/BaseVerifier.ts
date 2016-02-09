///<reference path='IRulebookFactory.ts' />
///<reference path='../IUtility.ts' />
///<reference path='../Data/VerificationResult.ts' />
///<reference path='../Data/Proof.ts' />
///<reference path='../Data/IJustification.ts' />

import { Proof } from "../Data/Proof";
import { VerificationResult } from "../Data/VerificationResult";
import { ValidResult } from "../Data/ValidResult";

class BaseVerifier {
  public util: IUtility;
  public log: (...args: any[]) => void;
  private rulebookFactory: IRulebookFactory;

  constructor(util: IUtility, rulebookFactory: IRulebookFactory) {
    this.util = util;
    this.log = util.debug;
    this.rulebookFactory = rulebookFactory;
  }

  public Verify(proof: IProof): VerificationResult {
    for (var i = 0; i < proof.Steps.length; i++) {
      var result = this.ValidateStatement(proof, i);
      if (!result.Valid)
        return result;
    }
    return new VerificationResult(true, "Proof is valid.");
  }

  public ValidateStatement(proof: IProof, step: number): VerificationResult {
    var stmt = proof.Steps[step];
    if (stmt[0] === 'error')
      return new VerificationResult(false, "Proof invalid due to syntax errors.", step + 1);

    var validator = this.rulebookFactory.FetchRule(stmt.Justification.ruleName);
    if (validator == null)
      return new VerificationResult(false, `Rule not found: ${stmt.Justification}.`);

    var type = proof.Steps[step].Justification.ruleType;
    var formatResult = this.CheckFormat(validator.ReasonFormat(type), proof, step);
    if (!formatResult.Valid) return formatResult;

    var partRef = proof.Steps[step].Justification.sideReference;
    var stepRefs = proof.Steps[step].Justification.lineReferences;

    var result = validator.Exec(proof, step, partRef, stepRefs);
    result.ErrorStep = step;
    return result;
  }

  public CheckFormat(format: IReasonFormat, proof: IProof, step: number): IVerificationResult {
    //this.log("%j %j", proof, step);

    if (step < 0 || step > proof.Steps.length - 1)
      return new VerificationResult(false, `Step ${step + 1} out of range (1 - ${proof.Steps.length}).`);

    var vCheck = this.checkParams(format, proof, step);
    if (vCheck !== true) {
      vCheck += " " + proof.Steps[step].Justification;
      return new VerificationResult(false, vCheck, step + 1);
    }

    return new ValidResult();
  }

  public checkParams(format, proof, step): any {
    var justification = proof.Steps[step].Justification;
    //console.log("%j %j", justification, format);
    if (format.isParameterless) {
      if (justification.hasLineReferences || justification.hasSubstitution || justification.hasSideReference)
        return `Justification '${justification.ruleName}' does not permit parameters.`;
    }

    var steps = justification.lineReferences;
    var partNum = justification.sideReference;
    var subst = justification.substitution;

    if (format.HasPart) {
      if (!(partNum == 1 || partNum == 2))
        return "Part number must be 1 or 2";
    } else
      if (justification.hasSideReference)
        return "Step part (e.g., 2 in 'and e2') not applicable, in this context.";

    if (format.StepRefs) {
      if (!steps || steps.length != format.StepRefs.length) {
        var f = format.StepRefs
          .map(function(e) { return e == "num" ? "n" : "n-m" });
        return "Step reference mismatch. Required format: " + f.join(", ") + ".";
      }
      for (var i = 0; i < steps.length; i++) {
        if (format.StepRefs[i] == "num") {
          if (steps[i].length != 1)
            return `Step reference #${i + 1} must be a single number.`;
          var n = steps[i][0];
          if (!(n >= 1 && n < step + 1))
            return `Step reference #${i + 1} to line ${n} must be 1 <= step < current.`;

          var refStep = proof.Steps[n-1];
          var thisStep = proof.Steps[step];
          if (refStep.Scope.depth > thisStep.Scope.depth)
            return `Step reference #${i + 1} may not reach into deeper scopes.`;
        } else {
          var ab = steps[i];
          if (ab.length != 2)
            throw new Error("Unexpected step reference format: " + JSON.stringify(ab));

          if (ab[0] > ab[1] || Math.max(ab[0], ab[1]) >= step + 1)
            return `Step reference #${i + 1} must be range, a-b, with a <= b < currentStep.`;

          var refStep0 = proof.Steps[ab[0] - 1];
          var refStep1 = proof.Steps[ab[1] - 1];
          var thisStep = proof.Steps[step];
          if (refStep0.Scope.depth != refStep1.Scope.depth)
            return `Step range reference #${i + 1} must begin and end in same scope.`;

          if ((refStep0.Scope.depth > thisStep.Scope.depth)
            || (refStep1.Scope.depth > thisStep.Scope.depth)) {
            // Criteria:
            // 1. cannot be more than one level deeper.
            // 2. Must begin and end in same level.
            // 3. Must reference entirety of deeper scope.
            if (refStep0.Scope.depth - thisStep.Scope.depth > 1
              || refStep1.Scope.depth - thisStep.Scope.depth > 1)
              return `Steps in step range #${i + 1} cannot be more than one scope deeper than current step.`;

            if (refStep0.Scope.depth > thisStep.Scope.Depth && ! refStep0.isFirstStmt)
              return `First step in range #${i + 1} is in deeper scope, but not scope's first step. Must be first step.`;

            if (refStep1.Scope.depth > thisStep.Scope.Depth && ! refStep1.isLastStmt)
              return `Last step in range #${i + 1} is in deeper scope, but not scope's last step. Must be last step.`;

          }
        }
      }
    } else if (justification.hasLineReference) {
      return "Step references not applicable, here.";
    }

    if (format.Substitution) {
      if (!subst)
        return "Substitution specification required (e.g., A.x/x0 intro n-m)";

      if (subst.length != 2)
        return "Substitution format must have two components (e.g., A.x/x0 intro n-m.)";
    } else if (justification.hasSubstitution) {
      return "Substitution not applicable, here.";
    }

    return true;
  }
}

export { BaseVerifier };
