var foljsWeb = (function() {
	var obj = {};
	obj.verifyFromAST = function(ast) {
		var proof = preprocess(ast);
	};

	// proof = { 1 : Rule(), 2 : Rule() ... };
	obj.verify = function(proof) {
	};

	function preprocess(ast) {
		var proof = {};
		return proof;
	}

	var rules = {
		"premise" : function(proof, line) { return true; },
		"assumption" : function(proof, line) { return true; },
		"->" : {
			"introduction" : {
			},
			"elimination" : {
			}
		}
	};
	return obj;
})();
