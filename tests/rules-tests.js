var v = require("../build/verifier.js").Verifier;
var p = require("../folproof-parser.js");

exports["Substitution (= elim) works for unbound vars."] = function(test) {
	var src = "a -> A.a(a -> c) -> b\n"
				  + "a = x\n"
					+ "x -> A.a(a -> c) -> b : = e 2,1\n";

	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid);
	test.done();
}

exports["Substitution (= elim) fails for bound vars."] = function(test) {
	var src = "a -> A.a(a -> c) -> b\n"
				  + "a = x\n"
					+ "x -> A.a(x -> c) -> b : = e 2,1\n";

	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid);
	test.done();
}

exports["Substitution (= elim) works for any # of unbound vars."] = function(test) {
	var src = "a -> A.a(a -> c) -> b or a and a \n"
				  + "a = x\n"
					+ "x -> A.a(a -> c) -> b or a and x : = e 2,1\n";

	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid);
	test.done();
}

exports["_|_ elimination fails when reference line not contradiction."] = function(test) {
	var src = "c\na -> b : contra e 1\n";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid);
	test.done();
}

exports["_|_ elimination succeeds when reference line is contradiction."] = function(test) {
	var src = "_|_\na -> b : contra e 1\n";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid);
	test.done();
}

exports["notnot elimination fails when reference line not a double-negation."] = function(test) {
	var src = "~c\nc : notnot e 1\n";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid);
	test.done();
}

exports["notnot elimination succeeds when reference line double-negation of current line."] = function(test) {
	var src = "~~c\nc : notnot e 1\n";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["LEM works."] = function(test) {
	var src = "(a -> b) or not (a -> b) : LEM";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["LEM fails when not in form: phi or not phi."] = function(test) {
	var src = "(a -> b) or (a -> b) : LEM";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["MT works."] = function(test) {
	var src = "a -> b\n~b\n~a : MT 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["MT fails when ref 1 not implication."] = function(test) {
	var src = "a and b\n~b\n~a : MT 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["MT fails when ref 2 not negation of right side of ref 1."] = function(test) {
	var src = "a -> b\nb\n~a : MT 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["MT fails when current line not negation of left side of ref 1."] = function(test) {
	var src = "a -> b\n~b\na : MT 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["And introduction fails when reference is not a tautology."] = function(test) {
	var src = "a\n~b\na and b : and i 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	src = "~a\nb\na and b : and i 1,2";
	ast = p.parse(src);
	result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["And introduction succeeds when references are tautologies."] = function(test) {
	var src = "a\nb\na and b : and i 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["And elimination fails when reference side doesn't match current step."] = function(test) {
	var src = "a and b\nb : and e1 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	src = "a and b\na : and e2 1";
	ast = p.parse(src);
	result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["And elimination succeeds when reference side matches current step."] = function(test) {
	var src = "a and b\na : and e1 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	src = "a and b\nb : and e2 1";
	ast = p.parse(src);
	result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Or elimination succeeds when assumptions produce same result."] = function(test) {
	var src = "a or b\n~a\n~b\n| a : assumption\n| _|_ : not e 2,4\n---\n"
					+ "| b : assumption\n| _|_ : not e 3,6\n_|_ : or e 1,4-5,6-7";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Or elimination fails when assumptions don't begin with or side."] = function(test) {
	var src = "a or b\n~a\n~b\n| c : assumption\n---\n"
					+ "| c : assumption\nc : or e 1,4-4,5-5";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Or elimination fails when assumptions don't produce same result."] = function(test) {
	var src = "a or b\n~a\n~b\n| a : assumption\n| _|_ : not e 2,4\n---\n"
					+ "| b : assumption\n| _|_ : not e 3,6\n| c : contra e 6\n_|_ : or e 1,4-5,6-8";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Or introduction succeeds when side matches reference."] = function(test) {
	var src = "a\na or b : or i1 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	src = "a\nb or a : or i2 1";
	ast = p.parse(src);
	result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Or introduction fails when side does not match reference."] = function(test) {
	var src = "~a\na or b : or i1 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	src = "~a\nb or a : or i2 1";
	ast = p.parse(src);
	result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Not introduction succeeds when reference is contradiction."] = function(test) {
	var src = "a\n| ~a : assumption\n| _|_ : not e 1,2\n~~a : not i 2-3";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Not introduction fails when reference is not contradiction."] = function(test) {
	var src = "a\n| ~a : assumption\n~~a : not i 2-2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Not elimination succeeds when reference is negation of current step."] = function(test) {
	var src = "a\n~a\n_|_ : not e 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Not elimination fails when reference is not a negation of current step."] = function(test) {
	var src = "a\n~b\n_|_ : not e 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Implication introduction succeeds when left and right side match first and last step of assumption."] = function(test) {
	var src = "|a : assumption\n|a or b : or i1 1\na -> (a or b) : -> i 1-2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Implication introduction fails when left or right side don't match beginning or end of assumption."] = function(test) {
	var src = "|a : assumption\n|a or b : or i1 1\nb -> (a or b) : -> i 1-2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	src = "|a : assumption\n|a or c : or i1 1\na -> (a or b) : -> i 1-2";
	ast = p.parse(src);
	result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Implication elimination succeeds when left side matches 2nd ref step, and right side matches current step."] = function(test) {
	var src = "a -> b\na\nb : -> e 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Implication elimination fails when left side doesn't match 2nd ref step."] = function(test) {
	var src = "a -> b\nc\nb : -> e 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Implication elimination fails when right side doesn't match current step."] = function(test) {
	var src = "a -> b\na\nc : -> e 1,2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Forall elimination succeeds when referenced step matches after substition."] = function(test) {
	var src = "A.x P(x)\nP(a) : A.x/a elim 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Forall elimination fails when referenced step doesn't match."] = function(test) {
	var src = "A.x P(x)\nQ(a) : A.x/a elim 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Forall introduction succeeds when ref is assumption and final step matches current step, under subst."] = function(test) {
	var src = "| with x0\n| P(x0) : assumption\nA.x P(x) : A.x/x0 i 1-1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Forall introduction fails when reference range is not an assumption."] = function(test) {
	var src = "P(x) : premise\nA.x P(x) : A.x/x i 1-1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.ok(result.message.indexOf("without a scoping assumption") >= 0, "Error must be because of missing assumption");
	test.done();
}

exports["Forall introduction fails when reference range is not a scoping assumption."] = function(test) {
	var src = "| P(x) : assumption\nA.x P(x) : A.x/x i 1-1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.ok(result.message.indexOf("without a scoping assumption") >= 0, "Error must be because of missing assumption");
	test.done();
}

exports["Forall introduction fails when reference range ending step doesn't match current step under subst."] = function(test) {
	var src = "| with x0\n| P(x0) : assumption\nA.x Q(x) : A.x/x0 i 1-1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.ok(result.message.indexOf("Last step in range") >= 0, "Error must be because of last step mismatch");
	test.done();
}

exports["Exists introduction succeeds when referenced step matches after substitution."] = function(test) {
	var src = "P(a)\nE.x P(x) : E.x/a intro 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Exists introduction fails when referenced step doesn't match after substitution."] = function(test) {
	var src = "P(a)\nE.x Q(x) : E.x/a intro 1";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	src = "P(a)\nE.y P(y) : E.x/a intro 1";
	ast = p.parse(src);
	result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Exists elimination succeeds when referenced step range is assumption & concl. matches current step."] = function(test) {
	var src = "E.a P(a)\n| with x0\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\n| E.a(P(a) or Q(a)) : E.a/x0 i 3\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-4";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Exists elimination fails when referenced step range is not assumption."] = function(test) {
	var src = "E.a P(a)\nE.a P(a) or Q(a)\n : or i1 2\nE.a P(a) or Q(a) : E.x/a elim 1,2-2";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Exists elimination fails when referenced step range is not scoping assumption."] = function(test) {
	var src = "E.a P(a)\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\n| E.a(P(a) or Q(a)) : E.a/x0 i 3\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-4";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}

exports["Exists elimination fails when assumption conclusion doesn't match current step."] = function(test) {
	var src = "E.a P(a)\n| with x0\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-3";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.ok(result.message.indexOf("ending step") >= 0, "Must fail because ending step.");
	test.done();
}

exports["Exists elimination fails when assumption start doesn't match first exists ref step."] = function(test) {
	var src = "E.a Q(a)\n| with x0\n| P(x0) : assumption\n| P(x0) or Q(x0)\n : or i1 2\nE.a(P(a) or Q(a)) : E.a/x0 elim 1,2-3";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.ok(result.message.indexOf("beginning step") >= 0, "Must fail because beginning step doesn't match exists step.");
	test.done();
}

exports["Copy succeeds when reference line is exact match."] = function(test) {
	var src = "a\n|~b : assumption\n|a : copy 1\n~b -> a : -> i 2-3";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(result.valid, result.message);
	test.done();
}

exports["Copy fails when reference line is not exact match."] = function(test) {
	var src = "a\n|~a : assumption\n|b : copy 1\n~a -> a : -> i 2-3";
	var ast = p.parse(src);
	var result = v.VerifyFromAST(ast);
	test.ok(!result.valid, result.message);
	test.done();
}
