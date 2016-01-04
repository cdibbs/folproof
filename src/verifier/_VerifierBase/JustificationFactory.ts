class JustificationFactory implements IJustificationFactory {

  public constructor(IRulebook)

  /**
   * Takes an abstract syntax tree fragment representing a proof justification
   * and returns an instance of the Justification object.
   * @param ast   A justification, e.g., "PBC 1,3-5". For the moment, this
   *              is a lexer-generated string array further parsed by a regex,
   *              not a true AST.
   * @returns     A Justification object.
   */
  public Justification buildFromASTFrag(ast: string[]): Justification {
    var ast = this.ParseJustification(ast);
    return new Justification();
  }

  /**
   * Takes a string representation of a Justification AST and parses it.
   * TODO: Ideally, someday this will be handled via a separate parser with a
   * well-defined, extensible grammar.
   */
  public string[] parseJustification(why: string) {
    // input:
    // yytext = [name, rtype, side, lineranges, sub]
    // output:
    // ['justification', ['name', 'A.', ['/', 'x', 'y']], 'intro'/'elim', '1'/'2', [[a], [b,c], ...]]
    var name = parseName(why[0])
        , jType = why[1]
        , jSide = why[2]
        , jLineRanges = parseLineRanges(why[3]);

    return ['justification', name, jType, jSide, jLineRanges];
  }

  private string[] parseName(jName: string, sub: string) {
    var ast = ['name'];
    var nameParts = jName.split('.');
    if (nameParts.length == 2) { // then it's a substitution
      nameParts[0] = nameParts[0] + ".";
      ast.push(nameParts[0], ['/', nameParts[1], sub]);
    } else {
      ast.push(jName);
    }
    return ast;
  }

  private number[] parseLineRanges(linesRaw: string[]) {
    var lines = [];
    for (var rline in linesRaw) {
      var parts = rline.split('-');
      if (parts.length == 2) {
        lines.push([parseInt(parts[0]), parseInt(parts[1])]);
      } else {
        lines.push(parseInt(parts[0]));
      }
    }
  }
}
