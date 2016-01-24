/// <reference path='../../_VerifierBase/BaseVerifier'/>
/// <reference path="../../Utility" />
/// <reference path="PLRulebookFactory" />
import { Utility } from "../../Utility";
import { BaseVerifier } from "../../_VerifierBase/BaseVerifier";
import { PLRulebookFactory } from "./PLRulebookFactory";

class PLVerifier extends BaseVerifier {
  public constructor() {
    super(new Utility(true), new PLRulebookFactory());
  }
}

export { PLVerifier };