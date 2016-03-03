///<reference path="IFOLRule.ts" />
///<reference path="../../_VerifierBase/IReasonFormat.ts" />

import { RuleBase } from "../RuleBase";

class FOLRuleBase extends RuleBase implements IFOLRule {
  Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: ISubstitution, ...args: any[]): IVerificationResult {
      throw new Error(`Unimplemented for rule ${this.Name}`);
  }
}

export { FOLRuleBase }
