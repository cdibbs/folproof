/// <reference path='../../_VerifierBase/IRulebookFactory.ts' />
/// <reference path='../../_VerifierBase/IRule.ts' />

import { ForallRule, ExistsRule, SubstitutionRule } from "./Rules";
import { PLRulebookFactory } from "../PL/PLRulebookFactory";
import { VerificationResult } from "../../Data/VerificationResult";

class FOLRulebookFactory implements IRulebookFactory {
  constructor(
      private debug: (...args: any[]) => void = () => {})
  {
  }

  FetchRule(name: string) {
    name = name.toLowerCase();
    if (this.rules[name])
      return this.rules[name];

    return null;
  }

  BuildRulebook(): { [id: string] : IRule } {
    var plFactory = new PLRulebookFactory();
    this.rules = plFactory.BuildRulebook();
    this.rules["a."] = new ForallRule();
    this.rules["e."] = new ExistsRule();
    this.rules["="] = new SubstitutionRule();
    return this.rules;
  }

  private rules: { [id: string] : IRule };
}

export { FOLRulebookFactory }
