interface LProof {
    parser: Parser;
}

interface Parser {
    parser: (input: string) => { [id: string]: any };
}
