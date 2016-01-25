///<reference path="IReasonFormat" />
// format = { hasPart : (true/false), stepRefs : ("num" | "range")*, subst : (true/false) };

class ReasonFormat implements IReasonFormat {
  public constructor(
      public HasPart: boolean,
      public StepRefs: string[], // ("num" | "range")*
      public Substitution: boolean) {};
      
  public get isParameterless() { return !this.HasPart && this.StepRefs == null && !this.Substitution; }
}

export { ReasonFormat }