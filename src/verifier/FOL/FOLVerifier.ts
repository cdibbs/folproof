/// <reference path='VerifierBase/BaseVerifier'/>
/// <reference path="Utilities.ts" />
import Utilities = require("Utilities");

class FOLVerifier extends BaseVerifier<FOLRulebookFactory> {
  public constructor() {
    super(new Utilities(true), new FOLRulebookFactory());
  }
}

export FOLVerifier;
