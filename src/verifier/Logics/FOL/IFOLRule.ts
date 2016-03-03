///<reference path="../../_VerifierBase/IRule.ts" />

interface IFOLRule extends IRule {
  Exec: {
    (proof: IProof, step: number, partRef: number, stepRefs: number[][], subst: ISubstitution, ...args: any[]): IVerificationResult;
  }
}
