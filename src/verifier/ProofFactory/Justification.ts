///<reference path="IJustification.ts" />

/**
 * Represents the justification component of a proof line.
 */
class Justification implements IJustification {
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
  public constructor(ast: any) {
    this.name = ast[1][1];
    this.sub1 = ast[1].length == 3 ? ast[1][3][1] : null;
    this.sub2 = ast[1].length == 3 ? ast[1][3][2] : null;
    this.type = ast[2];
    this.side = ast[3];
    this.lineRefs = ast[4];
  }

  public ruleName() { return this.name; }
  public substitutionLeft() { return this.sub1; }
  public substitutionRight() { return this.sub2; }
  public ruleType() { return this.type; }
  public sideReference() { return this.side; }
  public lineReferences(): number[][] { return this.lineRefs; }
}

export { Justification }
