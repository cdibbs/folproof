/* FOL.js grammar by Chris Dibbern */
%options flex
%options token-stack
%ebnf

%%

proof
	: clause_list EOL? ENDOFFILE
	{ $$ = $clause_list; return $$; }
	;

clause_list
	: box
	{ $$ = [$box]; }
	| clause_list EOL box
	{ $$ = $clause_list; $$.push($box); }
	| 
	{ $$ = []; }
	;

box
	: BOX with EOL clause_list EOL? DEBOX
	{ $$ = ['folbox', $clause_list, $with, @$]; 
		if ($clause_list && $clause_list[0] && $clause_list[0][0] == 'rule' && $clause_list[0][2].auto)
			$clause_list[0][2] = ['assumption', null];
	}	
	| BOX clause_list EOL? DEBOX
	{ $$ = ['box', $clause_list, @$]; 
		if ($clause_list && $clause_list[0] && $clause_list[0][0] == 'rule' && $clause_list[0][2].auto)
			$clause_list[0][2] = ['assumption', null];
	}	
	| sentence JUSTIFICATION?
	{ $$ = $sentence[0] != 'error'
			? ['rule', $sentence, $2, @$]
			: $sentence; 
		if ($$[0] === 'rule' && !$$[2]) {
			$$[2] = ['premise', null];
			$$[2].auto = true;
		}
	}
	;

with
	: WITH ID
	{ $$ = ['with', $2]; }
	;

sentence
	: e_iff
	| error
	{ $$ = ['error', yytext]; }
	;

e_iff
	: e_iff IFF e_imp
	{ $$ = ['iff', $e_iff, $e_imp]; }
	| e_imp
	{ $$ = $1; }
	;

e_imp
	: e_exists IMPLIES e_imp
	{ $$ = ['->', $e_exists, $e_imp]; }
	| e_exists
	{ $$ = $1; }
	;

e_exists
	: EXISTS ID e_exists
	{ $$ = ['exists', $ID, $e_exists]; }
	| e_forall
	{ $$ = $1; }
	;

e_forall
	: FORALL ID e_forall
	{ $$ = ['forall', $ID, $e_forall]; }
	| e_or
	{ $$ = $e_or; }
	;

e_or
	: e_or OR e_and
	{ $$ = ['or', $e_or, $e_and]; }
	| e_and
	{ $$ = $1; }
	;

e_and
	: e_and AND e_eq
	{ $$ = ['and', $e_and, $e_eq]; }
	| e_eq
	{ $$ = $1; }
	;

e_eq
	: e_eq EQUALS e_not
	{ $$ = ['=', $e_eq, $e_not]; }
	| e_not
	{ $$ = $1; }
	;

e_not
	: NOT e_not
	{ $$ = ['not', $e_not]; }
	| atom
	{ $$ = $atom; }
	;

atom
	: term
	{ $$ = $term; }
	| LPAREN sentence RPAREN
	{ $$ = $sentence; $$.userParens = true; }
	;

term_list
	: term
	{ $$ = [$term]; }
	| term COMMA term_list
	{ $$ = $term_list; $$.unshift($term); }
	;

term
	: ID LPAREN term_list RPAREN
	{ $$ = ['id', $ID, $term_list]; }
	| ID LPAREN RPAREN
	{ $$ = ['id', $ID, []]; }
	| ID
	{ $$ = ['id', $ID]; }
	;
