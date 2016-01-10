
class Statement {
    private sentenceAST: string[];
    private justificationAST: string[];
    private scope: any;
    private loc: any;
    private isFirst: boolean;
    private isLast:boolean;

    constructor(sentenceAST, justificationAST, scope, loc, isFirst, isLast) {
        this.sentenceAST = sentenceAST;
        this.justificationAST = justificationAST;
        this.scope = scope;
        this.loc = loc;
        this.isFirst = isFirst;
        this.isLast = isLast;
    }

    get isFirstStmt() { return this.isFirst; }
    get isLastStmt() { return this.isLast; }
    get Sentence() { return this.sentenceAST; }
    get Scope() { return this.scope; }
    get Justification() { return this.justificationAST; }
    get Meta() { return this.loc; }
}

export { Statement }
