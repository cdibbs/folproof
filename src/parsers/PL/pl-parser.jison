/* Propositional logic grammar by Chris Dibbern */
%options flex
%options token-stack
%ebnf

%%
proof: clause_list EOL? ENDOFFILE
	{ $$ = $clause_list; return $$; }
	;

clause_list: box
	{ $$ = [$box]; }
	| clause_list EOL box
	{ $$ = $clause_list; $$.push($box); }
	|
	{ $$ = []; }
	;

box: BOX clause_list EOL? DEBOX
	{ $$ = ['box', $clause_list, @$];
		if ($clause_list && $clause_list[0] && $clause_list[0][0] == 'rule' && $clause_list[0][2].auto)
			$clause_list[0][2] = ['assumption', null];
	}
	| sentence JUSTIFICATION?
	{ $$ = $sentence[0] != 'error' ? ['rule', $sentence, $2, @$] : $sentence;
		if ($$[0] === 'rule' && !$$[2]) {
			$$[2] = ['premise', null];
			$$[2].auto = true;
		}
	}
	;

sentence: e_imp
	| error /* special token recording a parsing error at this line. See Jison docs. */
	{ $$ = ['error', yytext]; }
	;

e_imp: e_or IMPLIES e_imp
	{ $$ = ['->', $e_or, $e_imp]; }
	| e_or
	{ $$ = $1; }
	;

e_or: e_or OR e_and
	{ $$ = ['or', $e_or, $e_and]; }
	| e_and
	{ $$ = $1; }
	;

e_and: e_and AND e_not
	{ $$ = ['and', $e_and, $e_not]; }
	| e_not
	{ $$ = $1; }
	;

e_not: NOT e_not
	{ $$ = ['not', $e_not]; }
	| atom
	{ $$ = $atom; }
	;

atom: ID
	{ $$ = ['id', $ID]; }
	| LPAREN sentence RPAREN
	{ $$ = $sentence; $$.userParens = true; }
	;
