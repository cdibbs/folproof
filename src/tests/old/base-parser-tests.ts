///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parsers/parser" />

import { Test, ITestGroup } from 'nodeunit';
import { Parser } from "../parsers/parser";

// Setup test group and mocks...
var parserTests: ITestGroup = {
  setUp: (callback) => { callback(); },
  tearDown: (callback) => { callback(); }
};

parserTests["Implication order is right-associative."] = (test: Test) => {
	var parser = new Parser();
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

parserTests["And order is left to right."] = (test: Test) => {
	var parser = new Parser();
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

parserTests["Or order is left to right."] = (test: Test) => {
	var parser = new Parser();
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

parserTests["Not precedes and."] = (test: Test) => {
	var parser = new Parser();
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

parserTests["And precedes or."] = (test: Test) => {
	var parser = new Parser();
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

parserTests["Exists binds stronger than implication."] = (test: Test) => {
	var parser = new Parser();
	var src = "E.x x -> y";
	var result = parser.parse(src);
	result = result[0][1];
	test.equal(result[0], '->');
	test.equal(result[1][0], 'exists');
	test.equal(result[1][2][1], 'x');
	test.equal(result[2][1], 'y');
	test.done();
};

parserTests["Forall binds stronger than implication."] = (test: Test) => {
	var parser = new Parser();
	var src = "A.x x -> y";
	var result = parser.parse(src);
	result = result[0][1];
	test.equal(result[0], '->');
	test.equal(result[1][0], 'forall');
	test.equal(result[1][2][1], 'x');
	test.equal(result[2][1], 'y');
	test.done();
};

parserTests["Can parse unary extension operators."] = (test: Test) => {
	var parser = new Parser();
	// future p and global q implies p weak-until r
	console.log("Running!");
	var src = "F. p and G. q -> p .W. r";
	var result = parser.parse(src);

	result = result[0][1];
	test.equal(result[0], 'F.');
	test.done();
};

export { parserTests }
