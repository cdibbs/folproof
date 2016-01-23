/// <reference path="IReasonFormat.ts" />

class Justifier {
  constructor(
      public reasonFormat: IReasonFormat,
      public callback: (...args: any[]) => {},
      public debug: (...args: any[]) => void = () => {})
  {
    console.log(debug, reasonFormat, callback);
  }

  public Exec(proof, step) {
      this.debug("%j %j", proof, step);
      var checked = this.checkParams(step, part, steps, subst);
      if (typeof checked === "string") return checked;
      return this.callback(proof, step, checked[0], checked[1], checked[2]);
  }

  private checkParams(curStep, part, steps, subst):any {
      if (this.reasonFormat === null) {
          if (part != null)
              return "Step part (e.g., 2 in 'and e2') not applicable, in this context.";
          if (steps != null)
              return "Step references not applicable.";
          if (subst != null)
              return "Substitutions not applicable.";
          return [];
      }

      var partNum = null, refNums = [], w = null;
      if (this.reasonFormat.HasPart) {
          partNum = parseInt(part);
          if (!(partNum == 1 || partNum == 2))
              return "Part number must be 1 or 2";
      } else
          if (part != null)
              return "Step part (e.g., 2 in 'and e2') not applicable, in this context.";

      if (this.reasonFormat.StepRefs) {
          if (steps.length != this.reasonFormat.StepRefs.length) {
              var f = this.reasonFormat.StepRefs
                  .map(function(e) { return e == "num" ? "n" : "n-m" });
              return "Step reference mismatch; required format: " + f.join(", ") + ".";
          }
          for (var i=0; i<steps.length; i++) {
              if (this.reasonFormat.StepRefs[i] == "num") {
                  var n = parseInt(steps[i]) - 1;
                  if (!(n >= 0 && n < curStep))
                      return "Step reference #" + (i + 1) + " must be 1 <= step < current.";
                  refNums.push(n);
              } else {
                  var ab = steps[i].split("-");
                  if (ab.length != 2)
                      return "Step reference # " + (i + 1) + " must be range, a-b, with a <= b.";

                  ab = [parseInt(ab[0]) - 1, parseInt(ab[1]) - 1];
                  if (ab[0] > ab[1] || Math.max(ab[0], ab[1]) >= curStep)
                      return "Step reference # " + (i + 1) + " must be range, a-b, with a <= b.";
                  refNums.push(ab);
              }
          }
      } else {
          if (steps != null)
              return "Step references not applicable, here.";
      }

      if (this.reasonFormat.Substitution) {
          if (!subst)
              return "Substitution specification required (e.g., A.x/x0 intro n-m)";
          w = subst.map(function(e) { return e.match("^[A-Za-z_][A-Za-z_0-9]*$"); });
          var allValidIds = w.reduce(function(a, e) { return a && e && e.length == 1 && e[0] });
          if (w.length != 2 || !allValidIds)
              return "Substitution format must match (e.g., A.x/x0 intro n-m.)";

          w = w.map(function(e) { return e[0] });
      } else {
          if (subst)
              return "Substitution unexpected.";
      }

      return [partNum, refNums, w];
  }
}

export { Justifier }
