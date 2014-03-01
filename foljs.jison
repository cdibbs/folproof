%lex
id		[a-zA-Z_'"0-9]+

%%
\n		return 'EOL';
\s+		/* ignore whitespace */
"and"		return 'AND';
"or"		return 'OR';
"implies"|"->"	return 'IMPLIES';
"iff"|"<->"	return 'IFF';
"not"|"~"|"!"	return 'NOT';
"union"		return 'UNION';
"intersection"	return 'INTERSECTION';
"every"		return 'EVERY';
"exists"	return 'EXISTS';
"in"		return 'IN';
"empty"		return 'EMPTYSET';
"forAll"	return 'FORALL';
"("		return 'LPAREN';
")"		return 'RPAREN';
{id}		return 'ID';
","		return 'COMMA';
<<EOF>>		return 'EOF';		

/lex

%%

proof
	: clause_list EOF
	{ $$ = $1; console.log("%j", $$); }
	;

clause_list
	: e_iff EOL clause_list
	{ $$ = $3; $$.unshift($1); }
	| e_iff
	{ $$ = [$1]; }
	;

e_forall
	: FORALL var e_forall
	{ $$ = ['forall', $var, $e_forall]; }
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
	: NOT id
	{ $$ = ['not', $id]; }
	| id
	{ $$ = $1; }
	;

id_list
	: id
	{ $$ = [$id]; }
	| id COMMA id_list
	{ $$ = $id_list; $$.unshift($id); }
	;

id
	: ID LPAREN id_list RPAREN
	{ $$ = ['id', $ID, $id_list]; }
	| ID LPAREN RPAREN
	{ $$ = ['id', $ID, []]; }
	| ID
	{ $$ = ['id', $ID]; }
	;
