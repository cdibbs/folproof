#!/usr/bin/env node
var Program = require('./cli').Program; // because tsc doesn't understand line 1, yet.
new Program().main();
