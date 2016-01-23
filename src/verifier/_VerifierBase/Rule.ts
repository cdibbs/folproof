class Rule implements IRule {
    constructor(
        private name: string,
        private type: string,
        private verifier: any,
        private introduction: any,
        private elimination: any)
    {
    }
    // { name : name,
    //   type : ["simple", "derived", "normal"],
    //   verifier : new Verifier(parseFormat, function(proof, step) {}),
    //   introduction : new Verifier(parseFormat, function(proof, step, part, steps, subst) {}),
    //   elimination : new Verifier(parseFormat, function(proof, step, part, steps, subst) {})
    // }
    get Name() { return this.name; }
    get Type() { return this.type; }
    get SimpleVerifier() { return this.verifier || null; }
    get IntroVerifier() { return this.introduction || null; }
    get ElimVerifier() { return this.elimination || null; }
    Exec() {
      if (this.Type() == "intro")
        return this.IntroVerifier().Exec();
      else if (this.Type() == "elim")
        return this.ElimVerifier().Exec();
      else if (this.Type() == "simple")
        return this.SimpleVerifer().Exec(proof, step);
      throw new Error("Please help!");
    }
}

export { Rule }
