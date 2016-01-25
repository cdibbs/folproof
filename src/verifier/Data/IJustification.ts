///<reference path="ISubstitution.ts" />

interface IJustification {
  ruleName:string;
  substitution:ISubstitution;
  hasSubstitution:boolean;
  ruleType:string;
  sideReference:number;
  lineReferences:number[][];
  hasSideReference: boolean;
  hasLineReferences:boolean;
}
