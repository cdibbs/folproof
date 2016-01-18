///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parsers/PL/pl" />

import { Test, ITestGroup } from 'nodeunit';
import { Parser } from "../parsers/PL/pl";

class PredLogParserTestFactory {
  getParserTests(MyParser: new () => Parser): ITestGroup {
    // Setup test group and mocks...
    var group = <ITestGroup>{
      setUp: (callback) => { callback(); },
      tearDown: (callback) => { callback(); }
    };

    group["Implication order is right-associative."] = (test: Test) => {
    	var parser = new MyParser();
    	var src = "a -> b -> c"; // a -> (b -> c)
    	var result = parser.parse(src);
    	result = result[0][1];
    	// roughly... ['->', ['id', 'a'], ['->', ['id', 'a'], ['id', 'b']], ['id', 'c']]
    	test.equal(result[1][0], 'id');
    	test.equal(result[1][1], 'a');
    	test.equal(result[2][0], '->');
    	test.equal(result[2][1][1], 'b');
    	test.equal(result[2][2][1], 'c');
    	test.done();
    };

    group["And binds before implication."] = (test: Test) => {
      var parser = new MyParser();
      var src = "a and b implies c and d"; // (a and b) -> (c -> d)
      var result = parser.parse(src);
      result = result[0][1];

      // ['and', ['->', ..], ['->', ..]]]
      test.equal(result[0], '->');
      test.equal(result[1][0], 'and');
      test.equal(result[2][0], 'and');
      test.done();
    };

    group["And order is left to right."] = (test: Test) => {
    	var parser = new MyParser();
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

    group["And binds before or."] = (test: Test) => {
      var parser = new MyParser();
      var src = "a and b or c and d";
      var result = parser.parse(src);
      result = result[0][1];

      test.equal(result[0], 'or');
      test.equal(result[1][0], 'and');
      test.equal(result[2][0], 'and');
      test.done();
    };

    group["Or order is left to right."] = (test: Test) => {
    	var parser = new MyParser();
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

    group["Not precedes and."] = (test: Test) => {
    	var parser = new MyParser();
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

    group["And precedes or."] = (test: Test) => {
    	var parser = new MyParser();
    	var src = "a or b and c";
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

    group["Consecutive nots bind tightly."] = (test: Test) => {
      var parser = new MyParser();
    	var src = "a and not not b";
    	var result = parser.parse(src);
    	result = result[0][1];

      test.equal(result[0], 'and');
      test.equal(result[1][0], 'id');
      test.equal(result[2][0], 'not');
      test.equal(result[2][1][0], 'not');
      test.equal(result[2][1][1][0], 'id');
      test.equal(result[2][1][1][1], 'b');
      test.done();
    };

    return group;
  }
}

export { PredLogParserTestFactory }
