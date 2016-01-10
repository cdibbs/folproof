///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parser/parser" />

import { Test, ITestGroup } from 'nodeunit';
import { Parser } from "../parser/PL/pl-parser";
import { PredLogParserTestFactory } from "./base-parser-tests";

var parserTestsPredLog = new PredLogParserTestFactory().getParserTests(Parser);

export { parserTestsPredLog }
