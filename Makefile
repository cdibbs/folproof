.PHONY: test folproof
colorful := '\n\n\e[1;34m%-6s\e[m\n'

all: folproof test

folproof: parsers
	@printf ${colorful} "Compiling verifier from TypeScript..."
	./node_modules/typescript/bin/tsc -t es5 -d --module commonjs --outDir build/verifier/ src/verifier/_VerifierBase/BaseVerifier.ts
	./node_modules/typescript/bin/tsc -t es5 -d --module commonjs --outDir build/verifier/ src/verifier/ProofFactory/ProofFactory.ts
	@printf ${colorful} "Compiling CLI..."
	if [ ! -d build/console ]; then mkdir -p build/console; fi
	./node_modules/typescript/bin/tsc -t es5 --module commonjs --outDir build/ src/console/program.ts
	cp src/console/cli.js build/console/
	@printf ${colorful} "Concatenating parser and verifier..."
	./node_modules/.bin/browserify --standalone folproof build/verifier/*.js build/parsers/**/*.js > folproof-verifier.js
	@printf ${colorful} "Done building folproof.\n\n"

test: parsers
	@printf ${colorful} "Compiling tests..."
	if [ ! -d build/tests ]; then mkdir -p build/tests; fi
	./node_modules/typescript/bin/tsc -t es5 --module commonjs --outDir build $(shell find ./src/tests -name "test-*.ts" -type f)
	@printf ${colorful} "Running tests..."
	./node_modules/nodeunit/bin/nodeunit $(shell find ./build/tests -name "test-*.js" -type f)

parsers:
	@printf ${colorful} "Compiling parsers from their Jison grammars..."
	if [ ! -d build/parsers/PL ]; then mkdir -p build/parsers/PL; fi
	./node_modules/jison/lib/cli.js src/parsers/PL/pl-parser.jison src/parsers/PL/pl-parser.jisonlex -o build/parsers/PL/pl.js
	if [ ! -d build/parsers/FOL ]; then mkdir -p build/parsers/FOL; fi
	./node_modules/jison/lib/cli.js src/parsers/FOL/fol-parser.jison src/parsers/FOL/fol-parser.jisonlex -o build/parsers/FOL/fol.js
	./node_modules/typescript/bin/tsc -t es5 -d --module commonjs --outDir build/parsers/ src/parsers/parsers.ts

clean:
	rm build/**/* -r
