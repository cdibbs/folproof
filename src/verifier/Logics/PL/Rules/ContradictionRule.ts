///<reference path="../../../_VerifierBase/IRule.ts" />
///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class ContradictionRule extends RuleBase {
    public get Name(): string { return "Contradiction"; }
    public get Type(): string { return "normal"; }
    private elimFormat: IReasonFormat = new ReasonFormat(false, ["num"], false);
    public ReasonFormat(type: string): IReasonFormat {
        if (type === "intro") throw new Error("Contradiction does not have an intro rule. Did you mean not elimination?");
        if (type === "elim") return this.elimFormat;
        throw new Error(`Unknown ${this.Name} variation ${type}.`);
    }

    public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var type = proof.Steps[step].Justification.ruleType;
        if (type === "intro") return new InvalidResult("Contradiction does not have an intro rule. Did you mean not elimination?");
        if (type === "elim") return this.ElimVerifier(proof, step, partRef, stepRefs);

        throw new Error(`Unknown ${this.Name} variation ${type}.`);
    }

    public ElimVerifier(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var refStep = proof.Steps[stepRefs[0][0] - 1].Expression;
        if (refStep[0] != 'id' || (refStep[1] != 'contradiction' && refStep[1] != '_|_'))
            return new InvalidResult("Contra-elim: Referenced step is not a contradiction.");

        return new ValidResult();
    }
}

export { ContradictionRule }
