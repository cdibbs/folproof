///<reference path='Statement.ts' />;
///<reference path="IProof.ts" />

import { Statement } from "./Statement";

class Proof implements IProof {
  public Steps: IStatement[] = new Array<IStatement>();
}

export { Proof }
