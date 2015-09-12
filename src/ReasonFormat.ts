// format = { hasPart : (true/false), stepRefs : ("num" | "range")*, subst : (true/false) };
module Verifier {
    export class ReasonFormat implements IReasonFormat {
        public HasPart: boolean = false; // (true/false)
        public StepRefs: string[]; // ("num" | "range")*
        public Substitution: boolean = false;
    }

    export interface IReasonFormat {
        HasPart?: boolean; // (true/false)
        StepRefs: string[]; // ("num" | "range")*
        Substitution?: boolean;
    }
}
