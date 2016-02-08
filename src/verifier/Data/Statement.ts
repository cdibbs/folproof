///<reference path='IJustification.ts' />
///<reference path="IStatement.ts" />
///<reference path="../Debug/ISourceMeta.ts" />

class Statement implements IStatement {
    private sentenceAST: any;
    private justificationAST: any;
    private justification: IJustification;
    private scope: any;
    private loc: ISourceMeta;
    private isFirst: boolean;
    private isLast:boolean;

    constructor(statementAST: any, justification: IJustification,
      scope: any, loc: ISourceMeta, isFirst: boolean, isLast: boolean) {
        this.sentenceAST = statementAST;
        this.justification = justification;
        this.scope = scope;
        this.loc = loc;
        this.isFirst = isFirst;
        this.isLast = isLast;
    }

    get isFirstStmt(): boolean { return this.isFirst; }
    get isLastStmt(): boolean { return this.isLast; }
    get Scope() { return this.scope; }
    get Expression():any { return this.sentenceAST; }
    get Justification():IJustification { return this.justification; }
    get Meta(): ISourceMeta { return this.loc; }

    public toString(): string {
      return JSON.stringify(this.sentenceAST) + `(1st: ${this.isFirstStmt}, last: ${this.isLastStmt}, scope: ${this.Scope})`;
    }
}

export { Statement }
