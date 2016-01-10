.PHONY: test folproof
colorful := '\n\n\e[1;34m%-6s\e[m\n'

all: folproof test

folproof:
	@printf ${colorful} "Compiling verifier from TypeScript..."
	./node_modules/typescript/bin/tsc -t es5 -d --module commonjs --outDir build/verifier/ src/verifier/_VerifierBase/BaseVerifier.ts
	./node_modules/typescript/bin/tsc -t es5 -d --module commonjs --outDir build/verifier/ src/verifier/ProofFactory/ProofFactory.ts
	@printf ${colorful} "Compiling parsers from their Jison grammars..."
	if [ ! -d build/parser/PL ]; then mkdir -p build/parser/PL; fi
	./node_modules/jison/lib/cli.js src/parser/PL/pl-parser.jison src/parser/PL/pl-parser.jisonlex -o build/parser/PL/pl-parser.js
	if [ ! -d build/parser/FOL ]; then mkdir -p build/parser/FOL; fi
	./node_modules/jison/lib/cli.js src/parser/FOL/fol-parser.jison src/parser/FOL/fol-parser.jisonlex -o build/parser/FOL/fol-parser.js
	@printf ${colorful} "Concatenating parser and verifier..."
	./node_modules/.bin/browserify --standalone folproof build/verifier/*.js build/parser/*.js > folproof-verifier.js
	@printf ${colorful} "Done building folproof.\n\n"

test:
	@printf ${colorful} "Compiling tests..."
	if [ ! -d build/tests ]; then mkdir build/tests; fi
	./node_modules/typescript/bin/tsc -t es5 --module commonjs --outDir build/tests src/tests/parser-tests-*.ts

	@printf ${colorful} "Running tests..."
	./node_modules/nodeunit/bin/nodeunit build/tests/parser*.js

clean:
	rm build/*.js
