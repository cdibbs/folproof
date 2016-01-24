///<reference path="../Data/IVerificationResult.ts" />
///<reference path="IReasonFormat.ts" />

interface IRule {
    Name:string;
    Type:string;
    ReasonFormat(type: string): IReasonFormat;
    Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][]): IVerificationResult;
}
