var Justifier = require("../src/justifier.js");

function dummyFn() { }

exports["Test Justifier rejects unexpected params."] = function(test) {
	var j = new Justifier({ hasPart : false, stepRefs : null, subst : false }, dummyFn);	
	var msg = j.checkParams(1, null, null, null);
	test.deepEqual(msg, [null, [], null], "Should return empty params, when params were expected empty.");
	msg = j.checkParams(1, "1", null, null);
	test.equal(typeof msg, "string", "Should return error, when part given, but unexpected.");
	msg = j.checkParams(1, null, ["1"], null);
	test.equal(typeof msg, "string", "Should return error, when steps given, but unexpected.");
	msg = j.checkParams(1, null, null, "a/x");
	test.equal(typeof msg, "string", "Should return error, when substitution given, but unexpected.");
	test.done();
};

exports["Test Justifier rejects non-numbers."] = function(test) {
	var j = new Justifier({ hasPart : false, stepRefs : ["num"], subst : false }, dummyFn);
	var msg = j.checkParams(1, null, ["a"], null);
	test.equal(typeof msg, "string", msg);
	test.done();
};

exports["Test justifier accepts numbers and number ranges."] = function(test) {
	var j = new Justifier({ hasPart : false, stepRefs : ["num", "range", "range", "num"], subst : false }, dummyFn);
	var msg = j.checkParams(5, null, ["1", "2-3", "2-3", "4"], null);
	test.deepEqual(msg, [null, [0, [1,2], [1,2], 3], null]);
	test.equal(typeof msg, "object", msg);
	test.done();
};

exports["Test justifier rejects out-of-range numbers."] = function(test) {
	var j = new Justifier({ hasPart : false, stepRefs : ["num", "range"], subst : false }, dummyFn);
	var msg = j.checkParams(1, null, ["1", "1-1"], null);
	test.deepEqual(msg, [null, [0, [0,0]], null]);
	msg = j.checkParams(1, null, ["2", "1-1"], null);
	test.equal(typeof msg, "string", "Should reject single step ref >= current step.");
	msg = j.checkParams(1, null, ["1", "2-2"], null);
	test.equal(typeof msg, "string", "Should reject ranges >= current step.");
	msg = j.checkParams(1, null, ["1", "3-2"], null);
	test.equal(typeof msg, "string", "Should reject ranges, a-b, when a>b.");
	test.done();
};

exports["Test justifier rejects parts != 1 or 2"] = function(test) {
	var j = new Justifier({ hasPart : true, stepRefs : null, subst : false }, dummyFn);
	var msg = j.checkParams(1, "1", null, null);
	test.deepEqual(msg, [1, [], null]);
	msg = j.checkParams(1, "2", null, null);
	test.deepEqual(msg, [2, [], null]);
	msg = j.checkParams(1, "3", null, null);
	test.equal(typeof msg, "string", "Should reject part != 1 or 2");
	msg = j.checkParams(1, "0", null, null);
	test.equal(typeof msg, "string", "Should reject part != 1 or 2");
	msg = j.checkParams(1, "a", null, null);
	test.equal(typeof msg, "string", "Should reject part != 1 or 2");
	test.done();
};

exports["Test justifier accepts proper format when expected"] = function(test) {
	var j = new Justifier({ hasPart : false, stepRefs : null, subst : true }, dummyFn);
	var msg = j.checkParams(1, null, null, null);	
	test.equal(typeof msg, "string", "Should return error, when substitution expected, but not provided.");
	var msg = j.checkParams(1, null, null, "1psi/2gamma");	
	test.equal(typeof msg, "string", "Should return error, when substitution ids not valid ids.");
	msg = j.checkParams(1, null, null, "psi/gamma");
	test.deepEqual(msg, [null, [], ["psi", "gamma"]]);
	test.done();
};
