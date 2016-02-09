///<reference path="../../../Data/IProof.ts" />
///<reference path="../../../_VerifierBase/IReasonFormat.ts" />
///<reference path="../../../Data/IVerificationResult.ts" />

import { ReasonFormat } from "../../../_VerifierBase/ReasonFormat";
import { InvalidResult } from "../../../Data/InvalidResult";
import { ValidResult } from "../../../Data/ValidResult";
import { RuleBase } from "../../RuleBase";

class PBCRule extends RuleBase {
    public get Name(): string { return "PBC"; }
    public get Type(): string { return "derived"; }
    private format: IReasonFormat = new ReasonFormat(false, ["range"], false);
    public ReasonFormat(): IReasonFormat { return this.format; }

    public Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult {
        var assumptionExpr = proof.Steps[stepRefs[0][0] - 1].Expression;
        var contraExpr = proof.Steps[stepRefs[0][1] - 1].Expression;
        if (! this.isContradiction(contraExpr))
            return new InvalidResult("PBC: Final step in range must be a contradiction.");

        if (assumptionExpr[0] !== 'not')
            return new InvalidResult("PBC: Assumption is not a negation. Might you be thinking of not-introduction?");

        var semEq = this.semanticEq(assumptionExpr[1], proof.Steps[step].Expression);
        if (! semEq)
            return new InvalidResult("PBC: Negation of assumption doesn't match current step.");

        return new ValidResult();
    }
}

export { PBCRule }
