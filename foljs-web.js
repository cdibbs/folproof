var foljsWeb = (function() {
	var obj = {};
	// Top-level AST will be an array of rules and boxes. Render them to HTML. :-)
	obj.render = function(ast) {
		var dom = $("<div></div>");
		renderRules(dom, ast, 1);
		return dom;
	}

	function renderRules(dom, ast, line) {
		for (var i=0; i<ast.length; i++) {
			if (ast[i][0] === 'rule') {
				line = renderRule(dom, ast[i], line);
			} else if (ast[i][0] === 'box') {
				line = renderSimpleBox(dom, ast[i], line);
			} else if (ast[i][0] === 'folbox') {
				line = renderFOLBox(dom, ast[i], line);
			}
		}
		return line;
	};

	function renderRule(dom, ast, line) {
		var nest = $("<div class='rule'></div>");
		nest.append("<span class='lineno'>" + line + "</span>");
		nest.append(renderClause(ast));
		nest.append(renderJustification(ast));
		dom.append(nest);
		return line + 1;
	}

	function renderClause(ast) {
		var c, l, r, op;
		if (!ast || !ast[1]) return "";

		switch(ast[1][0]) {
			case "forall": op = "&forall;"; break;
			case "exists": op = "&exist;";
		}
		if (op) {
			t = renderTerm(ast[1][1]);
			c = renderClause(ast[1][2]);
			t.prepend(op);
			t.append("(", c, ")");
			return t;
		}
		switch(ast[1][0]) {
			case "iff": op = "&harr;"; break;
			case "->": op = "&rarr;"; break;
			case "and": op = "&and;"; break;
			case "or": op = "&or;"; break;
			case "not": op = "&not;";
		}
		if (op) {
			console.log(ast[1][1]);
			l = renderClause(ast[1][1]);
			r = renderClause(ast[1][2]);
			l.append(op).append(r);
			return l;
		}
		if (ast[1][0] === "paren") {
			c = renderClause(ast[1]);
			c.prepend("(").append(")");
			return c;
		} else if (ast[0] === "id") {
			return renderTerm(ast);
		}
		return renderTerm(ast[1]);
	}

	function renderTerm(ast) {
		if (ast instanceof Array) {
			if (ast.length === 2) {
				return $("<span></span>").append(renderSimpleTerm(ast[1]));
			} else if (ast.length >= 3) {
				var term = $("<span class='term parameterized'></span>");
				term.append(renderSimpleTerm(ast[1]), "(");
				for (var i=0; i<ast[2].length; i++) {
					term.append(renderSimpleTerm(ast[2][i][1]));
					if (i < ast[2].length-1) term.append(", ");
				}
				term.append(")");
				return term;
			}
		} else {
			return renderSimpleTerm(ast);
		}
	}

	function renderSimpleTerm(t) {
		var symbols = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega".split(" ");
		var parts = t.match(/(.*?)(\d+)?$/);
		var sym = parts[1];
		// &Omega; and &omega; are different. &OmEGa; does not exist, hence the quirkiness
		// to allow users to distinguish between lower and uppercase greek letters.
		if ($.inArray(sym[0].toLowerCase() + sym.substr(1), symbols) !== -1) {
			sym = "&" + sym + ";";
		}
		if (parts[2]) {
			return $("<span class='special-symbol'>" + sym + "<sub>" + parts[2] + "</sub></span>");
		} else {
			return $("<span class='symbol'>" + sym + "</span>");
		}
	}
	
	function renderJustification(ast) {
		var nest = $("<div class='justification'></div>");
		nest.append(ast[2][0]);
		if (ast[2][1])
			nest.append(" ", ast[2][1].join(", "));
		return nest;
	}

	function renderSimpleBox(dom, ast, line) {
		var nest = $("<div class='simple-box'></div>");
		var lines = renderRules(nest, ast[1], line);
		dom.append(nest);
		return lines;
	}

	function renderFOLBox(dom, ast, line) {
		var nest = $("<div class='FOL-box'></div>");
		console.log(ast);
		nest.append(renderSimpleTerm(ast[2][1]));
		var line = renderRules(nest, ast[1], line);
		dom.append(nest);
		return line;
	}
	return obj;
})();
