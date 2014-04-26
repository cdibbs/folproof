var parser = require("../folproof-parser.js").parser;

exports["Implication order is right-associative."] = function(test) {
	var src = "a -> b -> c"; // a -> (b -> c)
	var result = parser.parse(src);
	result = result[0][1];
	// roughly... [['->', ['id', 'a'], ['->', ['id', 'a'], ['id', 'b']], ['id', 'c']]]
	test.equal(result[1][0], 'id');
	test.equal(result[1][1], 'a');
	test.equal(result[2][0], '->');
	test.equal(result[2][1][1], 'b');
	test.equal(result[2][2][1], 'c');
	test.done();
};

exports["And order is left to right."] = function(test) {
	var src = "a and b and c";
	var result = parser.parse(src);
	result = result[0][1];
	// roughly... [['and', ['and', ['id', 'a'], ['id', 'b']], ['id', 'c']]]
	test.equal(result[1][0], 'and');
	test.equal(result[1][1][1], 'a');
	test.equal(result[1][2][1], 'b');
	test.equal(result[2][1], 'c');
	test.done();
};

exports["Or order is left to right."] = function(test) {
	var src = "a or b or c"; // (a or b) or c
	var result = parser.parse(src);
	result = result[0][1];
	// roughly... ['or', ['or', ['id', 'a'], ['id', 'b']], ['id', 'c']]
	test.equal(result[1][0], 'or');
	test.equal(result[1][1][1], 'a');
	test.equal(result[1][2][1], 'b');
	test.equal(result[2][1], 'c');
	test.done();
};

exports["Not precedes and."] = function(test) {
	var src = "not a and b"; // (not a) and b
	var result = parser.parse(src);
	result = result[0][1];
	// roughly... ['and', ['not', ['id', 'a']], ['id', 'b']]
	test.equal(result[0], 'and');
	test.equal(result[1][0], 'not');
	test.equal(result[1][1][1], 'a');
	test.equal(result[2][1], 'b');
	test.done();
};

exports["And precedes or."] = function(test) {
	var src = "a or b and c"; // a or (b and c)
	var result = parser.parse(src);
	result = result[0][1];
	// roughly... ['or', ['id', 'a'], ['and', ['id', 'b'], ['id', 'c']]]
	test.equal(result[0], 'or');
	test.equal(result[1][1], 'a');
	test.equal(result[2][0], 'and');
	test.equal(result[2][1][1], 'b');
	test.equal(result[2][2][1], 'c');
	test.done();
};

exports["Exists binds stronger than implication."] = function(test) {
	var src = "E.x x -> y";
	var result = parser.parse(src);
	result = result[0][1];
	test.equal(result[0], '->');
	test.equal(result[1][0], 'exists');
	test.equal(result[1][2][1], 'x');
	test.equal(result[2][1], 'y');
	test.done();
};

exports["Forall binds stronger than implication."] = function(test) {
	var src = "A.x x -> y";
	var result = parser.parse(src);
	result = result[0][1];
	test.equal(result[0], '->');
	test.equal(result[1][0], 'forall');
	test.equal(result[1][2][1], 'x');
	test.equal(result[2][1], 'y');
	test.done();
};
