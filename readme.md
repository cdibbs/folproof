## Demo
TL;DR? Take it for a test drive: [//cdibbs.github.io/folproof](//cdibbs.github.io/folproof)

## Building
1. If you don't have node and npm installed, please install it.
 * Visit [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager), for more details.
2. Install the Jison parser generator `npm install jison`.
3. Run `make`.

## Installing (Optional)
If you'd like to run FOLProof in a shell, then proceed, here:
1. Install the build dependencies (node, npm, etc).
2. Within the folproof root directory, run `sudo npm -g install`.
 * This should install shell dependencies, like nomnom and path.

## Running
There are currently two ways to run FOLProof:
1) From the shell
 * After installation, just type `folproof [your proof].fol`.
2) From the web
 * Please look in the included index.html for an example of how to use FOLProof in a website.
 * You can test the included index.html [at the demo site](//cdibbs.github.io/folproof).

## Architecture Overview
* foljs-parser.js - built automatically from foljs-parser.jison and foljs-parser.jisonlex
* foljs-web.js - renders proof ASTs to HTML. Requires JQuery
* verifier.js - verifies proofs from ASTs
* cli.js - a short script to run verifier.js, from within a shell.
* index.html - provides a test interface

