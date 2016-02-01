///<reference path="../../../../typings/tsd.d.ts"/>
///<reference path="../../../verifier/Data/IStatement" />
///<reference path="../../../verifier/Data/IJustification" />
///<reference path="../../../verifier/_VerifierBase/IRulebookFactory" />
///<reference path="../../../verifier/IUtility" />
import { BaseVerifier } from "../../../verifier/_VerifierBase/BaseVerifier";
import { Proof } from "../../../verifier/Data/Proof";
import { ReasonFormat } from "../../../verifier/_VerifierBase/ReasonFormat";

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["BaseVerifier doesn't permit step references to reach deeper scopes."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var badRef = new MockJustification();
    badRef.lineReferences = [[1]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, [null]));
    p.Steps.push(new MockStatement(badRef, []));
    var format = new ReasonFormat(false, ["num"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 1);
    console.log(result);
    // Verify
    test.ok(result !== true, "Cannot reference deeper scope from outer!");
    test.done();
};

class MockRulebookFactory implements IRulebookFactory {
  FetchRule(name: string): IRule { return null; };
  BuildRulebook(): { [id: string] : IRule } { return {}; };
}

class MockStatement implements IStatement {
  public isFirstStmt: boolean = false;
  public isLastStmt: boolean = false;
  public Scope: any = [];
  public Expression:any = [];
  public Justification:IJustification;
  public Meta: ISourceMeta;

  public constructor(j:IJustification, scope: any) {
    this.Justification = j;
    this.Scope = scope;
  }
}

class MockJustification implements IJustification {
  public ruleName:string;
  public substitution:ISubstitution;
  public hasSubstitution:boolean;
  public ruleType:string;
  public sideReference:number;
  public lineReferences:number[][];
  public hasSideReference: boolean;
  public hasLineReferences:boolean;
}

class MockUtility implements IUtility {
  debugMode:boolean;

  debug(...args: any[]): void { }
}

var JustificationTests = group;
export { JustificationTests }
