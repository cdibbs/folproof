# Building
1. If you don't have node and npm installed, please install it.
 * Visit [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager), for more details.
2. Install the Jison parser generator `npm install jison`
3. Run `make`

# Running
Please see the included index.html. Right now, there is no command line interface for verifying proofs.
You can take it for a test drive at [//cdibbs.github.io/folproof](//cdibbs.github.io/folproof).

# Architecture Overview
* foljs-parser.js - built automatically from foljs-parser.jison and foljs-parser.jisonlex
* foljs-web.js - renders proof ASTs to HTML. Requires JQuery
* verifier.js - verifies proofs from ASTs
* index.html - provides a test interface

