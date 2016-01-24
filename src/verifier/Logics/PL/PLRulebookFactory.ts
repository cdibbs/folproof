/// <reference path='../../_VerifierBase/IRule.ts' />
/// <reference path='../../_VerifierBase/IRulebookFactory.ts' />

import { PremiseRule, AssumptionRule, LEMRule, CopyRule, AndRule, MTRule,
        NotRule, OrRule, PBCRule, ContradictionRule, DoubleNegationRule, ImplicationRule } from "./Rules";

class PLRulebookFactory implements IRulebookFactory {
    constructor(
        private debug: (...args: any[]) => void = () => { }) {
    }

    FetchRule(name: string) {
        console.log(name, this.rules[name].Exec);
        if (this.rules[name])
            return this.rules[name];

        return null;
    }

    BuildRulebook(): { [id: string]: IRule } {
        return this.rules;
    }

    private rules: { [id: string]: IRule } =
    {
        "premise": new PremiseRule(),
        "assumption": new AssumptionRule(),
        "lem": new LEMRule(),
        "copy": new CopyRule(),
        "mt": new MTRule(),
        "pbc": new PBCRule(),
        "contra": new ContradictionRule(),
        "notnot": new DoubleNegationRule(),
        "->": new ImplicationRule(),
        "and": new AndRule(),
        "or": new OrRule(),
        "not": new NotRule(),
    };
}

export { PLRulebookFactory }