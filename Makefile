.PHONY: test folproof

all: folproof test

folproof:
	@printf "Compiling verifier from TypeScript...\n\t"
	./node_modules/typescript/bin/tsc -t es5 --module commonjs --outFile build/verifier.js src/verifier.ts
	@printf "\n\nCompiling FOLProof parser from Jison grammar...\n\t"
	node ./node_modules/jison/lib/cli.js src/parser/parser.jison src/parser/parser.jisonlex
	@printf "\n\nConcatenating parser and verifier...\n\t"
	./node_modules/.bin/browserify --standalone folproof build/*.js > folproof-verifier.js
	@printf "Done.\n\n"

test:
	@printf "Running tests...\n"
	./node_modules/nodeunit/bin/nodeunit build/tests/*.js

clean:
	rm build/*.js
