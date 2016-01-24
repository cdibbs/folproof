///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class AndRule extends RuleBase {
    public get Name(): string { return "And"; }
    public get Type(): string { return "normal"; }
    private introFormat: IReasonFormat = new ReasonFormat(true, ["num"], false);
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
        var s = proof.Steps[step].Expression;
        if (s[0] !== 'and')
            return new InvalidResult("And-Intro: Current step is not an 'and'-expression.");

        if (this.semanticEq(s[1], proof.Steps[stepRefs[0][0]].Expression)) {
            if (this.semanticEq(s[2], proof.Steps[stepRefs[1][0]].Expression))
                return new ValidResult();
            return new InvalidResult("And-Intro: Right side doesn't match referenced step.");
        }

        return new InvalidResult("And-Intro: Left side doesn't match referenced step.");
    }
    
    public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var andExp = proof.Steps[stepRefs[0][0]].Expression;
        if (andExp[0] != 'and')
            return new InvalidResult("And-Elim: Referenced step is not an 'and' expression.");

        if (! this.semanticEq(andExp[partRef], proof.Steps[step].Expression))
            return new InvalidResult(`And-Elim: In referenced line, side ${partRef} does not match current step.`);

        return new ValidResult();
    }
}

export { AndRule }