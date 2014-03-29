/* FOL.js grammar by Chris Dibbern */
%options flex
%ebnf

%%

proof
	: clause_list EOL? ENDOFFILE
	{ $$ = $clause_list; console.log("%j", $$); }
	;

clause_list
	: box
	{ $$ = [$box]; }
	| clause_list EOL box
	{ $$ = $clause_list; $$.unshift($box); }
	;

box
	: BOX clause_list EOL DEBOX
	{ $$ = ['box', $clause_list]; }
	| sentence JUSTIFICATION?
	{ $$ = ['rule', $sentence, $2]; }
	;

sentence
	: e_quant
	| e_iff
	;

e_quant
	: FORALL ID sentence
	{ $$ = ['forall', $var, $sentence]; }
	| EXISTS ID sentence
	{ $$ = ['exists', $var, $sentence]; }
	;

e_iff
	: e_imp IFF e_iff
	{ $$ = ['iff', $e_imp, $e_iff]; }
	| e_imp
	{ $$ = $1; }
	;

e_imp
	: e_and IMPLIES e_imp
	{ $$ = ['->', $e_and, $e_imp]; }
	| e_and
	{ $$ = $1; }
	;

e_and
	: e_or AND e_and
	{ $$ = ['and', $e_or, $e_and]; }
	| e_or
	{ $$ = $1; }
	;

e_or
	: e_not OR e_or
	{ $$ = ['or', $e_not, $e_or]; }
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
	{ $$ = $id_list; $$.unshift($term); }
	;

term
	: ID LPAREN term_list RPAREN
	{ $$ = ['id', $ID, $id_list]; }
	| ID LPAREN RPAREN
	{ $$ = ['id', $ID, []]; }
	| ID
	{ $$ = ['id', $ID]; }
	;
