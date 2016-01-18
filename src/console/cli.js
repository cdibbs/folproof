#!/usr/bin/env node
// pure js because tsc doesn't understand hash bang in line 1, yet.
var Program = require('./program').Program;
new Program().main();
