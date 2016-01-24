///<reference path="../Debug/ISourceMeta.ts" />
///<reference path="IJustification.ts" />

interface IStatement {
  isFirstStmt: boolean;
  isLastStmt: boolean;
  Scope: any;
  Expression:any;
  Justification:IJustification;
  Meta: ISourceMeta;
}
