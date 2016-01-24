import { Utility } from "../../Utility";
import { BaseVerifier } from "../../_VerifierBase/BaseVerifier";
import { FOLRulebookFactory } from "./FOLRulebookFactory";

class FOLVerifier extends BaseVerifier {
  public constructor() {
    super(new Utility(true), new FOLRulebookFactory());
  }
}

export { FOLVerifier };
