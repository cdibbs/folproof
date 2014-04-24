var v = require("../src/verifier.js").Verifier;
var p = require("../folproof-parser.js");

exports["Substitution (= elim) works for unbound vars."] = function(test) {
	var src = "a -> A.a(a -> c) -> b\n"
				  + "a = x\n"
					+ "x -> A.a(a -> c) -> b : = e 2,1\n";

	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(result.valid);
	test.done();
}
	
exports["Substitution (= elim) fails for bound vars."] = function(test) {
	var src = "a -> A.a(a -> c) -> b\n"
				  + "a = x\n"
					+ "x -> A.a(x -> c) -> b : = e 2,1\n";

	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(!result.valid);
	test.done();
}
	
exports["Substitution (= elim) works for any # of unbound vars."] = function(test) {
	var src = "a -> A.a(a -> c) -> b or a and a \n"
				  + "a = x\n"
					+ "x -> A.a(a -> c) -> b or a and x : = e 2,1\n";

	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(result.valid);
	test.done();
}
	
