.PHONY: test folproof

all: folproof test

folproof:
	@printf "Compiling verifier from TypeScript...\n\t"
	./node_modules/typescript/bin/tsc -t es5 --module commonjs --outDir build/ src/verifier.ts
	@printf "\n\nCompiling FOLProof parser from Jison grammar...\n\t"
	node ./node_modules/jison/lib/cli.js src/parser/folproof-parser.jison src/parser/folproof-parser.jisonlex
	@printf "\n\nConcatenating parser and verifier...\n\t"
	./node_modules/.bin/browserify --standalone folproof build/*.js > folproof-verifier.js
	@printf "Done.\n\n"

test:
	@printf "Running tests...\n"
	./node_modules/nodeunit/bin/nodeunit tests/*.js

clean:
	rm build/*.js
