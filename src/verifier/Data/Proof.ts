///<reference path='Statement.ts' />;
///<reference path="IProof.ts" />

import { Statement } from "./Statement";
import { Scope } from "./Scope";

class Proof implements IProof {
  private _baseScope: IScope;
  public Steps: IStatement[] = new Array<IStatement>();

  constructor() {
    this._baseScope = new Scope(null, 0, "root");
  }

  public get baseScope(): IScope { return this._baseScope; }

  public toString(): string {
    return this.Steps.join('\n');
  }
}

export { Proof }
