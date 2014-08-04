[![Build Status](https://travis-ci.org/cdibbs/folproof.svg?branch=master)](https://travis-ci.org/cdibbs/folproof) 

## Demo
Take it for a test drive: [cdibbs.github.io/folproof](https://cdibbs.github.io/folproof)

## Building
1. If you don't have node and npm installed, please install it.
 * Visit [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager), for more details.
2. Run `npm install` to install the libraries FOLProof needs.
3. Run `make`.

## Installing (Optional)
If you'd like to run FOLProof in a shell, then proceed, here:

1. Install the build dependencies (node, npm, etc).
2. Within the folproof root directory, run `sudo npm -g install`.
 * This should install shell dependencies, like nomnom and path.

## Running
There are several ways to run FOLProof:

1. From the shell
 * After installation: type `folproof [your-proof].fol`, from anywhere.
 * Without installation: type `node cli.js [your-proof].fol`, from within the folproof directory.
2. From the web
 * Please look in the included index.html for an example of how to use FOLProof in a website.
 * You can test the included index.html [at the demo site](https://cdibbs.github.io/folproof).

## Architecture Overview
* folproof-parser.js - built automatically from ./src/parser/folproof-parser.jison and folproof-parser.jisonlex
* folproof-web.js - renders proof ASTs to HTML. Requires JQuery
* folproof-verifier.js - verifies proofs from ASTs (built from /src/*.js)
* cli.js - a short script to run verifier.js, from within a shell.
* index.html - provides a test interface

