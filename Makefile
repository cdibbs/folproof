.PHONY: test folproof

all: folproof test

folproof:
	jison src/parser/folproof-parser.jison src/parser/folproof-parser.jisonlex
	./node_modules/.bin/browserify --standalone folproof src/verifier.js > folproof-verifier.js

test:
	./node_modules/nodeunit/bin/nodeunit tests/*.js

