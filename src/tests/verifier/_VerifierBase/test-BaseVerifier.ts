///<reference path="../../../../typings/tsd.d.ts"/>
///<reference path="../../../verifier/Data/IStatement" />
///<reference path="../../../verifier/Data/IJustification" />
///<reference path="../../../verifier/_VerifierBase/IRulebookFactory" />
///<reference path="../../../verifier/IUtility" />
import { BaseVerifier } from "../../../verifier/_VerifierBase/BaseVerifier";
import { Proof } from "../../../verifier/Data/Proof";
import { Scope } from "../../../verifier/Data/Scope";
import { ReasonFormat } from "../../../verifier/_VerifierBase/ReasonFormat";

import { Test, ITestGroup } from 'nodeunit';

// Setup test group and mocks...
var group = <ITestGroup>{
    setUp: (callback) => { callback(); },
    tearDown: (callback) => { callback(); }
};

group["BaseVerifier doesn't permit single step references to reach into deeper scopes."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var badRef = new MockJustification();
    badRef.lineReferences = [[1]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, new Scope(1)));
    p.Steps.push(new MockStatement(badRef, new Scope(0)));
    var format = new ReasonFormat(false, ["num"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 1);

    // Verify
    test.ok(result !== true, "Cannot reference deeper scope from outer!");
    test.done();
};

group["BaseVerifier doesn't permit step to reference self or later steps."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var badRef = new MockJustification();
    badRef.lineReferences = [[2]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, new Scope(1)));
    p.Steps.push(new MockStatement(badRef, new Scope(0)));
    var format = new ReasonFormat(false, ["num"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 1);

    // Verify
    test.ok(result !== true, "Cannot reference step >= current!");
    test.done();
};

group["BaseVerifier permits single step references to shallower scopes."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var badRef = new MockJustification();
    badRef.lineReferences = [[1]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, new Scope(0)));
    p.Steps.push(new MockStatement(badRef, new Scope(1)));
    var format = new ReasonFormat(false, ["num"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 1);

    // Verify
    test.ok(result, "Must be able to reach shallower scopes!");
    test.done();
};

group["BaseVerifier permits step range references to shallower scopes."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var ref = new MockJustification();
    ref.lineReferences = [[1,2]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, new Scope(0)));
    p.Steps.push(new MockStatement(assm, new Scope(0)));
    p.Steps.push(new MockStatement(ref, new Scope(1)));
    var format = new ReasonFormat(false, ["range"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 2);

    // Verify
    test.ok(result, "Step range must be able to reach shallower scope!");
    test.done();
};

group["BaseVerifier forbids step range references to deeper scopes."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var badRef = new MockJustification();
    badRef.lineReferences = [[1,2]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, new Scope(1)));
    p.Steps.push(new MockStatement(assm, new Scope(1)));
    p.Steps.push(new MockStatement(badRef, new Scope(0)));
    var format = new ReasonFormat(false, ["range"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 2);

    // Verify
    test.ok(result !== true, "Step range must not reference into deeper scopes!");
    test.done();
};

group["BaseVerifier forbids trans-scope step range references."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var badRef = new MockJustification();
    badRef.lineReferences = [[1,2]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, new Scope(0)));
    p.Steps.push(new MockStatement(assm, new Scope(1)));
    p.Steps.push(new MockStatement(badRef, new Scope(0)));
    var format = new ReasonFormat(false, ["range"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 2);

    // Verify
    test.ok(result !== true, "Step ranges cannot transcend scopes!");
    test.done();
};

group["BaseVerifier forbids step range self-references."] = (test: Test) => {
    // e.g., [ 'justification', [ 'name', 'or' ], 'intro', '1', [ [ 0 ] ] ]
    // Setup
    var assm = new MockJustification();
    assm.ruleName = "assumption";
    var badRef = new MockJustification();
    badRef.lineReferences = [[1,3]]; // but line 1 is in a deeper scope!
    var p = new Proof();
    p.Steps.push(new MockStatement(assm, new Scope(0)));
    p.Steps.push(new MockStatement(assm, new Scope(1)));
    p.Steps.push(new MockStatement(badRef, new Scope(1)));
    var format = new ReasonFormat(false, ["range"], false);

    // Test
    var v = new BaseVerifier(new MockUtility(), new MockRulebookFactory());
    var result = v.checkParams(format, p, 2);

    // Verify
    test.ok(result !== true, "Step ranges cannot include current step!");
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
