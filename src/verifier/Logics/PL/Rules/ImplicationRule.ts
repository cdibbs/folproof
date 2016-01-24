///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class ImplicationRule extends RuleBase {
    public get Name(): string { return "Implication"; }
    public get Type(): string { return "normal"; }
    private introFormat: IReasonFormat = new ReasonFormat(false, ["range"], false);
    private elimFormat: IReasonFormat = new ReasonFormat(false, ["num", "num"], false);
    public ReasonFormat(type: string): IReasonFormat {
        if (type === "intro") return this.introFormat;
        if (type === "elim") return this.elimFormat;
        throw new Error(`Unknown ${this.Name} variation ${type}.`);
    }
            
    public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var type = proof.Steps[step].Justification.ruleType;
        if (type === "intro") return this.IntroVerifier(proof, step, partRef, stepRefs);
        if (type === "elim") return this.ElimVerifier(proof, step, partRef, stepRefs);
        
        throw new Error(`Unknown ${this.Name} variation ${type}.`);
    }
    
    public IntroVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var truth = proof.Steps[stepRefs[0][0]].Expression;
        var result = proof.Steps[stepRefs[0][1]].Expression;
        var implies = proof.Steps[step].Expression;
        if (implies[0] != '->')
            return new InvalidResult("Implies-Intro: Current step is not an implication");

        var truthSemEq = this.semanticEq(implies[1], truth);
        if (! truthSemEq)
            return new InvalidResult("Implies-Intro: The left side does not match the assumption.");

        var resultSemEq = this.semanticEq(implies[2], result);
        if (! resultSemEq)
            return new InvalidResult("Implies-Intro: The result does not match the right side.");

        return new ValidResult();
    }
    
    public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var truthStep = stepRefs[1][0], impliesStep = stepRefs[0][0];
        var truth = proof.Steps[truthStep].Expression;
        var implies = proof.Steps[impliesStep].Expression;
        if (implies[0] != '->')
            return new InvalidResult(`Implies-Elim: Step ${stepRefs[0][0]} is not an implication`);
            
        var truthSemEq = this.semanticEq(implies[1], truth);
        var resultSemEq = this.semanticEq(implies[2], proof.Steps[step].Expression);
        if (! truthSemEq)
            return new InvalidResult("Implies-Elim: The implication's left side does not match the referenced step.");
        if (! resultSemEq)
            return new InvalidResult("Implies-Elim: The left side does not imply this result.");
        
        return new ValidResult();
    }
}

export { ImplicationRule }