interface IJustification {
  ruleName():string;
  substitutionLeft():string;
  substitutionRight():string;
  ruleType():string;
  sideReference():string;
  lineReferences():number[][];
}
