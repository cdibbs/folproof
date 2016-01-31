///<reference path="IJustification.ts" />
///<reference path="ISubstitution.ts" />

import { Substitution } from "./Substitution";
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
    this.sub1 = ast[1].length == 3 ? ast[1][2][1] : null;
    this.sub2 = ast[1].length == 3 ? ast[1][2][2] : null;
    this.type = ast[2];
    this.side = ast[3];
    this.lineRefs = ast[4];
  }

  public get ruleName():string { return this.name; }
  public get substitution(): ISubstitution { return this.sub1 != null ? new Substitution(this.sub1, this.sub2) : null; }
  public get ruleType() { return this.type; }
  public get sideReference(): number { return this.side == null ? null : parseInt(this.side); }
  public get lineReferences(): number[][] { return this.lineRefs; }

  public get hasSubstitution(): boolean { return this.sub1 != null; }
  public get hasSideReference(): boolean { return this.side != null; }
  public get hasLineReferences(): boolean { return (this.lineRefs instanceof Array) && this.lineRefs.length > 0; }

  public toString() {
    return `${this.ruleName} ${this.ruleType}`
        + (this.hasSubstitution ? `, Sub: ${this.sub1}/${this.sub2}` : "")
        + (this.hasSideReference ? `, Side: ${this.sideReference}` : "")
        + (this.hasLineReferences ? `, Lines: ${this.lineReferences.join(",")}` : "");
  }
}

export { Justification }
