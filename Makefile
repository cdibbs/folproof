.PHONY: test folproof
colorful := '\n\n\e[1;34m%-6s\e[m\n'

all: folproof test

folproof:
	@printf ${colorful} "Compiling verifier from TypeScript..."
	./node_modules/typescript/bin/tsc -t es5 -d --module commonjs --outDir build/verifier/ src/verifier/_VerifierBase/BaseVerifier.ts
	@printf ${colorful} "Compiling FOLProof parser from Jison grammar..."
	if [ ! -d build/parser ]; then mkdir build/parser; fi
	./node_modules/jison/lib/cli.js src/parser/parser.jison src/parser/parser.jisonlex -o build/parser/parser.js
	@printf ${colorful} "Concatenating parser and verifier..."
	./node_modules/.bin/browserify --standalone folproof build/verifier/*.js build/parser/*.js > folproof-verifier.js
	@printf ${colorful} "Done building folproof.\n\n"

test:
	@printf ${colorful} "Compiling tests..."
	if [ ! -d build/tests ]; then mkdir build/tests; fi
	./node_modules/typescript/bin/tsc -t es5 --module commonjs --outDir build src/tests/verifier-tests.ts

	@printf ${colorful} "Running tests..."
	./node_modules/nodeunit/bin/nodeunit build/tests/*.js

clean:
	rm build/*.js
