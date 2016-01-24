///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class OrRule extends RuleBase {
    public get Name(): string { return "Or"; }
    public get Type(): string { return "normal"; }
    private introFormat: IReasonFormat = new ReasonFormat(true, ["num"], false);
    private elimFormat: IReasonFormat = new ReasonFormat(false, ["num", "range", "range"], false);
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
        if (s[0] !== 'or')
            return new InvalidResult("Or-Intro: Current step is not an 'or'-expression.");

        if (! this.semanticEq(s[partRef], proof.Steps[stepRefs[0][0]].Expression))
            return new InvalidResult(`Or-Intro: Side ${partRef} doesn't match referenced step.`);
            
        return new ValidResult();
    }
    
    public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var currStepExpr = proof.Steps[step].Expression;
        // FIXME: What potential is there here for false valids? Can we build a custom
        // stepRefs that will break this?
        var orStepExpr = proof.Steps[stepRefs[0][0]].Expression;
        var a1p1Expr = proof.Steps[stepRefs[1][0]].Expression;
        var a1p2Expr = proof.Steps[stepRefs[1][1]].Expression;
        var a2p1Expr = proof.Steps[stepRefs[2][0]].Expression;
        var a2p2Expr = proof.Steps[stepRefs[2][1]].Expression;

        // and through the gauntlet...
        if (orStepExpr[0] !== 'or')
            return new InvalidResult("Or-Elim: First referenced step is not an 'or'-expression.");
        if (!this.semanticEq(orStepExpr[1], a1p1Expr))
            return new InvalidResult("Or-Elim: First range intro doesn't match left side of 'or'.");
        if (!this.semanticEq(orStepExpr[2], a2p1Expr))
            return new InvalidResult("Or-Elim: Second range range intro doesn't match right side of 'or'.");
        if (!this.semanticEq(a1p2Expr, a2p2Expr))
            return new InvalidResult("Or-Elim: Step range conclusions don't match.");
        if (!this.semanticEq(a1p2Expr, currStepExpr))
            return new InvalidResult("Or-Elim: Current step doesn't match step range conclusions.");

        return new ValidResult();
    }
}

export { OrRule }