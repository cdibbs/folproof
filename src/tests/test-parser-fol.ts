///<reference path="../../typings/tsd.d.ts"/>

import { Test, ITestGroup } from 'nodeunit';
import { Parser } from "../parsers/FOL/fol";
import { PredLogParserTestFactory } from "./base-parser-tests";

var parserTestsFOL = new PredLogParserTestFactory().getParserTests(Parser);

parserTestsFOL["Exists binds stronger than implication."] = (test: Test) => {
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

parserTestsFOL["Forall binds stronger than implication."] = (test: Test) => {
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

export { parserTestsFOL }
