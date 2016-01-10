interface LProof {
    parser: Parser;
}

declare class Parser {
  yy: any;
  constructor();
  parse: (input: string) => { [id: string]: any };
}

export { Parser };
