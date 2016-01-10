id				[a-zA-Z_][a-zA-Z_'"0-9\|]*
spc				[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
numrange	[0-9]+(\-[0-9]+)?
justify		":".*

%%
[\n\r]?"#".*					/* comments are ignored */
"and"									return 'AND';
"or"									return 'OR';
"implies"|"->"|"=>"		return 'IMPLIES';
"not"|"~"|"!"					return 'NOT';
"union"								return 'UNION';
"intersection"				return 'INTERSECTION';
"="										return 'EQUALS';
"every"								return 'EVERY';
"with"								return 'WITH';
"of"									return "OF";
\d+				/* ignore digits, for now */
{justify}			%{
				// Syntax: "[...] : ruleName [[elim/intro] [NumOrRange[, NumOrRange]*]]

				// strip the leading colon and spaces
				yytext = yytext.substr(yytext.substr(1).search(/\S/));

				// find the beginning of the first line number
				yytext = yytext.trim();
				var pos = yytext.search(/\s+\d+/);
				var lineranges = null, name = yytext;
				if (pos != -1) {
					name = yytext.substr(0, pos);
					lineranges = yytext.substr(pos+1).split(/\s*,\s*/);
				}
				var parts = name.split(' ');
				var rtype = null, side = null;
				if (parts[0]) {
					name = parts[0];
					rtype = parts[1];
					if (rtype && (parts = rtype.match(/([a-zA-Z]+)(\d+)/))) {
						rtype = parts[1];
						side = parts[2];
					}
				}
				var sub = name.split('/');
				if (sub.length == 2) {
					name = sub[0];
					sub = sub[1];
				} else {
					sub = null;
				}
				yytext = [name, rtype, side, lineranges, sub];
				return 'JUSTIFICATION';
				%}
"E."				return 'EXISTS';
"in"				return 'IN';
"empty"			return 'EMPTYSET';
"A."				return 'FORALL';
{id}"."			return "UNARY_EXT";
"."{id}"."	return "BINARY_EXT";
"("					return 'LPAREN';
")"					return 'RPAREN';
{id}				return 'ID';
","					return 'COMMA';
[\n\r]*<<EOF>>		%{
				// remaining DEBOXes implied by EOF
				var tokens = [];

				while (this._iemitstack[0]) {
					tokens.unshift("DEBOX");
					this._iemitstack.shift();
				}
				tokens.unshift("ENDOFFILE");
				if (tokens.length) return tokens;
				%}
\n{spc}*"|"*"-"+			%{ /* manually close an assumption box */
				this._log("MANUAL DEBOX");
				this._iemitstack.shift();
				return ['DEBOX', 'EOL'];
				%}
[\n\r]+{spc}*/![^\n\r]		/* eat blank lines */
[\n|^]{spc}*\d*{spc}*"|"*		%{
				/* Similar to the idea of semantic whitespace, we keep track of virtual
				 * BOX/DEBOX characters based on a stack of | occurrences
				 */
				    var indentation = (yytext.match(/\|/g)||[]).length;
				    if (indentation > this._iemitstack[0]) {
					this._iemitstack.unshift(indentation);
					this._log(this.topState(), "BOX", this.stateStackSize());
					this.myBegin(this.topState(), 'deepening, due to indent'); // deepen our current state
					return ['BOX', 'EOL'];
				    }

				    var tokens = ["EOL"];
				    while (indentation < this._iemitstack[0]) {
					this.myPopState();
					this._log(this.topState(), "DEBOX", this.stateStackSize());
					tokens.push("DEBOX");
					this._iemitstack.shift();
				    }
				    if (tokens[tokens.length-1] === "DEBOX")
					    tokens.push("EOL");
				    return tokens;
				%}
\n				return 'EOL';
{spc}+				/* ignore whitespace */
.*				return 'error';

%%
var jisonLexerFn = lexer.setInput;
lexer.setInput = function(input) {
        var debug = false;
        this._iemitstack = [0];
        this._log = function() { if (debug) console.log.apply(this, arguments); };
        this.myBegin = function(state, why) { this._log("Begin " + state + " because " + why); this.begin(state); };
        this.myPopState = function() { this._log("Popping " + this.popState() + " to " + this.topState()); };
        return jisonLexerFn.call(this, input);
};
