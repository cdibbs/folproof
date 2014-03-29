id				[a-zA-Z_'"0-9]+
spc				[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]

%%
\n				return 'EOL';
"and"				return 'AND';
"or"				return 'OR';
"implies"|"->"|"=>"		return 'IMPLIES';
"iff"|"<->"|"=>"		return 'IFF';
"not"|"~"|"!"			return 'NOT';
"union"				return 'UNION';
"intersection"			return 'INTERSECTION';
"every"				return 'EVERY';
\d+				/* ignore line numbers, for now */
"exists"			return 'EXISTS';
"in"				return 'IN';
"empty"				return 'EMPTYSET';
"forAll"			return 'FORALL';
"("				return 'LPAREN';
")"				return 'RPAREN';
{id}				return 'ID';
","				return 'COMMA';
":".*				%{ yytext = yytext.substr(yytext.substr(1).search(/\S/)+1); return 'JUSTIFICATION'; %}
"|"+				%{
				/* Similar to the idea of semantic whitespace, we keep track of virtual
				 * BOX/DEBOX characters based on a stack of | occurrences
				 */
				    var indentation = yytext.length - yytext.search(/\s/) - 1;
				    if (indentation > this._iemitstack[0]) {
					this._iemitstack.unshift(indentation);
					this._log(this.topState(), "BOX", this.stateStackSize());
					this.myBegin(this.topState(), 'deepening, due to indent'); // deepen our current state
					return 'BOX';
				    }

				    var tokens = [];

				    while (indentation < this._iemitstack[0]) {
					this.myPopState();
					this._log(this.topState(), "DEBOX", this.stateStackSize());
					tokens.push("DEBOX");
					this._iemitstack.shift();
				    }
				    if (tokens.length) return tokens;

				%}
\s*<<EOF>>			%{
				// remaining DEBOXes implied by EOF
				var tokens = [];

				while (this._iemitstack[0]) {
					tokens.unshift("DEBOX");
					this._iemitstack.shift();
				}
				tokens.unshift("ENDOFFILE");
				if (tokens.length) return tokens;
				%}
"-"+				%{ this._log("DEBOX"); this._iemitstack.shift(); return 'DEBOX'; %} /* manually close an assumption box */
<<EOF>>				return 'EOF';		
\s+				/* ignore whitespace */

%%
jisonLexerFn = lexer.setInput;
lexer.setInput = function(input) {
        var debug = false;
        this._iemitstack = [0];
        this._log = function() { if (debug) console.log.apply(this, arguments); };
        this.myBegin = function(state, why) { this._log("Begin " + state + " because " + why); this.begin(state); };
        this.myPopState = function() { this._log("Popping " + this.popState() + " to " + this.topState()); };
        return jisonLexerFn.call(this, input);
};
