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
			console.log(ast[i]);
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
		dom.append(nest);
		return line + 1;
	}

	function renderClause(ast) {
		var nest, s, l, r;
		switch(ast[0]) {
			case "forall":
				s = renderClause(ast[2]);
				nest = $("&forall;" + ast[1] + " (" + s + ")");
				return nest;
			case "exists":
				s = renderClause(ast[2]);
				nest = $("&exist;" + ast[1] + " (" + s + ")");
				return nest;
			case "iff":
				l = renderClause(ast[1]);
				r = renderClause(ast[2]);
				nest = l.append("&iff;").append(r);
				return nest;
			case "->":
			case "and":
			case "or":
			case "not":
			case "paren":
			case "id":
				return renderTerm();
		}
	}

	function renderSimpleBox(dom, ast, line) {
		var nest = $("<div class='simple-box'></div>");
		var lines = renderRules(nest, ast[1], line);
		dom.append(nest);
		return lines;
	}

	function renderFOLBox(dom, ast, line) {
		var nest = $("<div class='FOL-box'></div>");
		var line = renderRules(nest, ast[1], line);
		dom.append(nest);
		return line;
	}
	return obj;
})();
