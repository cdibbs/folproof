///<reference path="IReasonFormat" />
// format = { hasPart : (true/false), stepRefs : ("num" | "range")*, subst : (true/false) };

class ReasonFormat implements IReasonFormat {
  public constructor(
      public HasPart: boolean,
      public StepRefs: string[], // ("num" | "range")*
      public Substitution: boolean) {};
}

export { ReasonFormat }