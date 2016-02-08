///<reference path="IStatement.ts" />
///<reference path="IScope.ts" />

interface IProof {
  Steps: IStatement[];
  baseScope: IScope;
}
