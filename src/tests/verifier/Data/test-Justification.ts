///<reference path="../../../../typings/tsd.d.ts"/>
import { Justification } from "../../../verifier/Data/Justification";

import { Test, ITestGroup } from 'nodeunit';
    
    // Setup test group and mocks...
    var group = <ITestGroup>{
      setUp: (callback) => { callback(); },
      tearDown: (callback) => { callback(); }
    };

    group["Justification constructor correctly digests AST frag."] = (test: Test) => {
        // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
        var example = [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ];
    	var j = new Justification(example);
    	test.ok(j.hasLineReferences);
        test.ok(j.hasSideReference);
        test.ok(!j.hasSubstitution);
    	test.done();
    };