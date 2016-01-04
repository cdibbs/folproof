/**
 * Represents the justification component of a proof line.
 */
class Justification {
  private name: string; // A., as in A.x/y
  private sub1: string; // x, as in A.x/y
  private sub2: string; // y, as in A.x/y
  private type: string; // intro/elim
  private side: string; // 1 or 2, as in intro1, elim1, etc
  private lineRefs: number[][]; // [[a], [b,c], [d,e]], as in a, b-c, d-e

  /**
   * @param ast     Abstract Syntax Tree fragment of the form ['justification',
   *                ['name', 'A.', ['/', 'x', 'y']], 'intro'/'elim', '1'/'2',
   *                [[a], [b,c], ...]]
   */
  public constructor(ast: string) {
    name = ast[1][1];
    sub1 = ast[1].length == 3 ? ast[1][3][1] : null;
    sub2 = ast[1].length == 3 ? ast[1][3][2] : null;
    type = ast[2];
    side = ast[3];
    lineRefs = ast[4];
  }

  public ruleName() => name;
  public substitutionLeft() => sub1;
  public substitutionRight() => sub2;
  public ruleType() => type;
  public sideReference() => side;
  public lineReferences() => lineRefs;
}

export { Justification }
