interface IScope {
  id: string;
  alias: string;
  depth: number;
  variable: string;
  hasVariable: boolean;
  ancestorVariable: string;
  hasAncestorVariable: boolean;
  hasParent: boolean;
  parent: IScope;

  ancestorVariableMatch(testVar: string): boolean;
}
