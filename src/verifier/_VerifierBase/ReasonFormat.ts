// format = { hasPart : (true/false), stepRefs : ("num" | "range")*, subst : (true/false) };

class ReasonFormat implements IReasonFormat {
  public HasPart: boolean = false; // (true/false)
  public StepRefs: string[]; // ("num" | "range")*
  public Substitution: boolean = false;
}
