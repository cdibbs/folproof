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

exports["_|_ elimination fails when reference line not contradiction."] = function(test) {
	var src = "c\na -> b : contra e 1\n";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(!result.valid);
	test.done();
}	

exports["_|_ elimination succeeds when reference line is contradiction."] = function(test) {
	var src = "_|_\na -> b : contra e 1\n";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(result.valid);
	test.done();
}	

exports["notnot elimination fails when reference line not a double-negation."] = function(test) {
	var src = "~c\nc : notnot e 1\n";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(!result.valid);
	test.done();
}	

exports["notnot elimination succeeds when reference line double-negation of current line."] = function(test) {
	var src = "~~c\nc : notnot e 1\n";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["LEM works."] = function(test) {
	var src = "(a -> b) or not (a -> b) : LEM";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["LEM fails when not in form: phi or not phi."] = function(test) {
	var src = "(a -> b) or (a -> b) : LEM";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["MT works."] = function(test) {
	var src = "a -> b\n~b\n~a : MT 1,2";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["MT fails when ref 1 not implication."] = function(test) {
	var src = "a and b\n~b\n~a : MT 1,2";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["MT fails when ref 2 not negation of right side of ref 1."] = function(test) {
	var src = "a -> b\nb\n~a : MT 1,2";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["MT fails when current line not negation of left side of ref 1."] = function(test) {
	var src = "a -> b\n~b\na : MT 1,2";	
	var ast = p.parse(src);
	var result = v.verifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}
