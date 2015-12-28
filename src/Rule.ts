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
}

interface IRule {
    Name:string;
    Type:string;
    SimpleVerifier: any;
    IntroVerifier: any;
    ElimVerifier: any;
}
