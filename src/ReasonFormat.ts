// format = { hasPart : (true/false), stepRefs : ("num" | "range")*, subst : (true/false) };
module Verifier {
    export class ReasonFormat {
        public HasPart: boolean; // (true/false)
        public StepRefs: string[]; // ("num" | "range")*
        public Substitution: boolean;
    }
}
