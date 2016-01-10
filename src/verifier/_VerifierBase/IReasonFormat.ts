interface IReasonFormat {
  HasPart?: boolean; // (true/false)
  StepRefs: string[]; // ("num" | "range")*
  Substitution?: boolean;
}
