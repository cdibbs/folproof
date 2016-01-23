///<reference path='IJustification.ts' />
///<reference path='Justification.ts' />
import { Justification } from "./Justification";

class Statement {
    private sentenceAST: string[];
    private justificationAST: string[];
    private justification: IJustification;
    private scope: any;
    private loc: any;
    private isFirst: boolean;
    private isLast:boolean;

    constructor(sentenceAST: any, justification: IJustification,
      scope: any, loc: any, isFirst: boolean, isLast: boolean) {
        this.sentenceAST = sentenceAST;
        this.justification = justification;
        this.scope = scope;
        this.loc = loc;
        this.isFirst = isFirst;
        this.isLast = isLast;
    }

    get isFirstStmt() { return this.isFirst; }
    get isLastStmt() { return this.isLast; }
    get Sentence() { return this.sentenceAST; }
    get Scope() { return this.scope; }
    get Justification():IJustification { return this.justification; }
    get Meta() { return this.loc; }
}

export { Statement }
