///<reference path="../../typings/tsd.d.ts"/>
///<reference path="../parsers/PL/pl" />

import { Test, ITestGroup } from 'nodeunit';
import { Parser } from "../parsers/PL/pl";
import { PredLogParserTestFactory } from "./base-parser-tests";

var parserTestsPredLog = new PredLogParserTestFactory().getParserTests(Parser);

export { parserTestsPredLog }
