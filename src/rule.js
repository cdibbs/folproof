var Rule = function Rule(options) {
	// { name : name,
	//   type : ["simple", "derived", "normal"], 
	//   verifier : new Verifier(parseFormat, function(proof, step) {}),
	//   introduction : new Verifier(parseFormat, function(proof, step, part, steps, subst) {}),
	//   elimination : new Verifier(parseFormat, function(proof, step, part, steps, subst) {})
	// }
	this.getName = function getName() { return options.name; };
	this.getType = function getType() { return options.type; };
	this.getSimpleVerifier = function getSimpleVerifier() { return options.verifier || null; };
	this.getIntroVerifier = function getIntroVerifier() { return options.introduction || null; };
	this.getElimVerifier = function getElimVerifier() { return options.elimination || null; };
};

module.exports = Rule;
