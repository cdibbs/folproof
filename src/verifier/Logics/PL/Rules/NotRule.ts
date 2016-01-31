///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class NotRule extends RuleBase {
    public get Name(): string { return "Not"; }
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
        var stepRefsZeroBase = stepRefs.map(function(r) { return r.map(function(r2) { return r2 - 1; })});
        if (type === "intro") return this.IntroVerifier(proof, step, partRef, stepRefsZeroBase);
        if (type === "elim") return this.ElimVerifier(proof, step, partRef, stepRefsZeroBase);

        throw new Error(`Unknown ${this.Name} variation ${type}.`);
    }

    public IntroVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var assumptionExpr = proof.Steps[stepRefs[0][0]].Expression;
        var contraExpr = proof.Steps[stepRefs[0][1]].Expression;
        if (! this.isContradiction(contraExpr)) {
            return new InvalidResult("Not-Intro: Final step in range must be a contradiction.");
        }
        var curStep = proof.Steps[step].Expression;
        if (curStep[0] !== 'not')
            return new InvalidResult("Not-Intro: Current step is not a negation. Might you be thinking of PBC?");

        if (! this.semanticEq(assumptionExpr, curStep[1]))
            return new InvalidResult("Not-Intro: Negation of assumption doesn't match current step.");

        return new ValidResult();
    }

    public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var s = proof.Steps[step].Expression;
        if (! this.isContradiction(s))
            return new InvalidResult("Not-Elim: Current step is not a contradiction.");

        var step1expr = proof.Steps[stepRefs[0][0]].Expression;
        var step2expr = proof.Steps[stepRefs[1][0]].Expression;
        var semEq;
        if (step1expr[0] === 'not') {
            semEq = this.semanticEq(step1expr[1], step2expr);
        } else if (step2expr[0] === 'not') {
            semEq = this.semanticEq(step2expr[1], step1expr);
        } else {
            return new InvalidResult("Not-Elim: Neither referenced proof step is a 'not' expression.");
        }

        if (! semEq)
            return new InvalidResult("Not-Elim: Subexpression in not-expr does not match other expr.");

        return new ValidResult();
    }
}

export { NotRule }
