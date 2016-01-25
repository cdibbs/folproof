///<reference path="IJustificationFactory.ts" />
///<reference path="../Data/Justification.ts" />

import { Justification } from "../Data/Justification";

class JustificationFactory implements IJustificationFactory {

  /**
   * Takes an abstract syntax tree fragment representing a proof justification
   * and returns an instance of the Justification object.
   * @param ast   A justification, e.g., "PBC 1,3-5". For the moment, this
   *              is a lexer-generated string array further parsed by a regex,
   *              not a true AST.
   * @returns     A Justification object.
   */
  public buildFromASTFrag(ast: any): IJustification {
    var processedAST = this.parseJustification(ast);
    return new Justification(processedAST);
  }

  /**
   * Takes a string representation of a Justification AST and parses it.
   * TODO: Ideally, someday this will be handled via a separate parser with a
   * well-defined, extensible grammar.
   */
  public parseJustification(why: any): any {
    // input:
    // yytext = [name, rtype, side, lineranges, sub]
    // output:
    // ['justification', ['name', 'A.', ['/', 'x', 'y']], 'intro'/'elim', '1'/'2', [[a], [b,c], ...]]
    var name = this.parseName(why[0], why[4])
        , jType = why[1]
        , jSide = why[2]
        , jLineRanges = this.parseLineRanges(why[3]);
    return ['justification', name, jType, jSide, jLineRanges];
  }

  private parseName(jName: string, sub: string): string[] {
    var ast:any = ['name'];
    var nameParts = jName.split('.');
    if (nameParts.length == 2) { // then it's a substitution
      nameParts[0] = nameParts[0] + ".";
      ast.push(nameParts[0], ['/', nameParts[1], sub]);
    } else {
      ast.push(jName);
    }
    return ast;
  }

  private parseLineRanges(linesRaw: string[]): number[] {
    var lines = [];
    for (var rline in linesRaw) {
      var parts = rline.split('-');
      if (parts.length == 2) {
        lines.push([parseInt(parts[0]), parseInt(parts[1])]);
      } else if (parts.length == 1) {
        lines.push([parseInt(parts[0])]);
      }
    }
    return lines;
  }
}

export { JustificationFactory }
