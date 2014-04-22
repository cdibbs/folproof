// Used for rendering fol.js proofs to HTML. Requires JQuery.
var folproofWeb = (function() {
	var debugMode = false;
	var obj = {};
	var defaultOpts = {
		parentheses : "user"
	};

	// Top-level AST will be an array of rules and boxes. Render them to HTML. :-)
	obj.render = function(ast, opts) {
		var options = $.extend({}, defaultOpts, opts);
		var dom = $("<div></div>");
		if (!ast) return dom;
		renderRules(dom, ast, 1, options);
		return dom;
	}

	function renderRules(dom, ast, line, options) {
		for (var i=0; i<ast.length; i++) {
			debug(ast[i]);
			if (ast[i][0] === 'rule') {
				line = renderRule(dom, ast[i], line, options);
			} else if (ast[i][0] === 'box') {
				line = renderSimpleBox(dom, ast[i], line, options);
			} else if (ast[i][0] === 'folbox') {
				line = renderFOLBox(dom, ast[i], line, options);
			}
		}
		return line;
	};

	function renderRule(dom, ast, line, options) {
		var nest = $("<div class='rule'></div>");
		nest.append("<span class='lineno'>" + line + "</span>");
		nest.append(renderClause(ast[1], options));
		nest.append(renderJustification(ast[2], options));
		dom.append(nest);
		return line + 1;
	}

	function renderClause(ast, options) {
		var c, l, r, op, reqParens = requireParens(ast, options);

		switch(ast[0]) {
			case "forall": op = "&forall;"; break;
			case "exists": op = "&exist;";
		}
		if (op) {
			t = renderTerm(ast[1], options);
			c = renderClause(ast[2], options);
			t.prepend(op);
			if (reqParens) t.append("(");
			t.append(c);
			if (reqParens) t.append(")");
			return t;
		}
		switch(ast[0]) {
			case "iff": op = "&harr;"; break;
			case "->": op = "&rarr;"; break;
			case "and": op = "&and;"; break;
			case "or": op = "&or;"; break;
			case "=": op = "=";
		}
		if (op) {
			debug(ast[1], ast[2]);
			l = renderClause(ast[1], options);
			r = renderClause(ast[2], options);
			l.append(" ", op, " ").append(r);
			if (reqParens)
				l.prepend("(").append(")");
			return l;
		}
		
		if (ast[0] === "id") {
			return renderTerm(ast, options);
		} else if (ast[0] === "not") {
			l = renderClause(ast[1], options);
			l.prepend("&not;");
			if (reqParens)
				l.prepend("(").append(")");
			return l;
		}
		return renderTerm(ast);
	}

	function requireParens(ast, options) {
		if (options.parentheses === "user") {
			return ast.userParens;
		}
		return true;
	}

	var infixTerms = ['='];
	function renderTerm(ast, options) {
		if (ast instanceof Array) {
			if (ast.length === 2) {
				return $("<span></span>").append(renderSimpleTerm(ast[1], options));
			} else if (ast.length >= 3) {
				var term = $("<span class='term parameterized'></span>");
				if ($.inArray(ast[1], infixTerms) == -1) {
					term.append(renderSimpleTerm(ast[1], options), "(");
					for (var i=0; i<ast[2].length; i++) {
						term.append(renderSimpleTerm(ast[2][i][1], options));
						if (i < ast[2].length-1) term.append(", ");
					}
					term.append(")");
				} else { // infix
					term.append(ast[2][0][1]," ", ast[1], " ", ast[2][1][1]);
				}
				return term;
			}
		} else {
			return renderSimpleTerm(ast, options);
		}
	}

	function renderSimpleTerm(t, options) {
		var symbols = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega".split(" ");
		var others = {
			"_|_" : "&perp;", "contradiction" : "&perp;"
		};
		var parts = t.match(/(.*?)(\d+)?$/);
		var sym = parts[1];
		// &Omega; and &omega; are different. &OmEGa; does not exist, hence the quirkiness
		// to allow users to distinguish between lower and uppercase greek letters.
		if ($.inArray(sym[0].toLowerCase() + sym.substr(1), symbols) !== -1) {
			sym = "&" + sym + ";";
		} else if (others[sym]) {
			sym = others[sym];
		}
		if (parts[2]) {
			return $("<span class='special-symbol'>" + sym + "<sub>" + parts[2] + "</sub></span>");
		} else {
			return $("<span class='symbol'>" + sym + "</span>");
		}
	}
	
	function renderJustification(ast, options) {
		var nest = $("<div class='justification'></div>");
		nest.append(ast[0], " ", ast[1]);
		if (ast[2]) nest.append(ast[2]);
		if (ast[3])
			nest.append(" ", ast[3].join(", "));
		return nest;
	}

	function renderSimpleBox(dom, ast, line, options) {
		var nest = $("<div class='simple-box'></div>");
		var lines = renderRules(nest, ast[1], line, options);
		dom.append(nest);
		return lines;
	}

	function renderFOLBox(dom, ast, line) {
		var nest = $("<div class='FOL-box'></div>");
		debug(ast);
		nest.append(renderSimpleTerm(ast[2][1]));
		var line = renderRules(nest, ast[1], line, options);
		dom.append(nest);
		return line;
	}
	return obj;

	function debug() {
		if (debugMode)
			console.log.apply(console, Array.prototype.slice.call(arguments, 0));
	}
})();
