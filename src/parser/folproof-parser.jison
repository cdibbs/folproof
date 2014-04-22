/* FOL.js grammar by Chris Dibbern */
%options flex
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
	: BOX with EOL clause_list EOL DEBOX
	{ $$ = ['folbox', $clause_list, $with, @$]; }
	| BOX clause_list EOL DEBOX
	{ $$ = ['box', $clause_list, @$]; }
	| sentence JUSTIFICATION?
	{ $$ = ['rule', $sentence, $2 ? $2 : ["premise", null], @$]; }
	;

with
	: WITH ID
	{ $$ = ['with', $2]; }
	;

sentence
	: e_iff
	;

e_iff
	: e_iff IFF e_imp
	{ $$ = ['iff', $e_iff, $e_imp]; }
	| e_imp
	{ $$ = $1; }
	;

e_imp
	: e_imp IMPLIES e_exists
	{ $$ = ['->', $e_imp, $e_exists]; }
	| e_exists
	{ $$ = $1; }
	;

e_exists
	: EXISTS ID e_forall
	{ $$ = ['exists', $ID, $e_forall]; }
	| e_forall
	{ $$ = $1; }
	;

e_forall
	: FORALL ID e_or
	{ $$ = ['forall', $ID, $e_or]; }
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
	: NOT atom
	{ $$ = ['not', $atom]; }
	| atom
	{ $$ = $atom; }
	;

atom
	: term
	{ $$ = $term; }
	| LPAREN sentence RPAREN
	{ $$ = $sentence; }
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
