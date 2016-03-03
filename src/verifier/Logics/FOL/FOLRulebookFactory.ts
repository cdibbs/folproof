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

        private rules: { [id: string] : IRule } =
        {
            /*"a." : {
                Name : "ForAll",
                Type : "normal",
                IntroVerifier : new Justifier(
                    { StepRefs : ["range"], Substitution : true },
                    function(proof, step, part, steps, subst):any {
                        var currStep = proof.steps[step];
                        var currExpr = currStep.getSentence();
                        var startStep = proof.steps[steps[0][0]];
                        var startExpr = startStep.getSentence();
                        var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
                        var endExpr = proof.steps[steps[0][1]].getSentence();
                        if (currExpr[0] !== 'forall')
                            return "All-x-Intro: Current step is not a 'for-all' expression.";
                        if (scope.length == 0 || scope[0] == null)
                            return "All-x-Intro: Not valid without a scoping assumption (e.g., an x0 box).";

                        // check if any substitutions from our scope match refExpr
                        var scopeVar = scope[scope.length-1];
                        var found = scope.slice().reverse().reduce(function(a,e) { return a && (e == null || e == subst[1]); }, true);
                        if (! found)
                            return "All-x-intro: Substitution " + subst[1] + " doesn't match scope: " + scope.filter(function(e) { if (e != null) return e; }).join(", ");

                        var endExprSub = this.substitute(endExpr, subst[1], subst[0]);
                        if (this.semanticEq(endExprSub, currExpr[2]))
                            return true;
                        return "All-x-Intro: Last step in range doesn't match current step after " + subst[0] + "/" + subst[1] + ".";
                    }),
                ElimVerifier : new Justifier(
                    { StepRefs : ["num"], Substitution: true },
                    function(proof, step, part, steps, subst):any {
                        var currStep = proof.steps[step];
                        var currExpr = currStep.getSentence();
                        var refExpr = proof.steps[steps[0]].getSentence();
                        if (refExpr[0] !== 'forall')
                            return "All-x-Elim: Referenced step is not a for-all expression.";

                            var refExprSub = this.substitute(refExpr[2], subst[0], subst[1]);
                            if (this.semanticEq(refExprSub, currExpr))
                                return true;

                        return "All-x-Elim: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + ".";
                    })
            },
            "e." : {
                Name : "Exists",
                Type : "normal",
                IntroVerifier : new Justifier(
                    { StepRefs: ["num"], Substitution: true },
                    function(proof, step, part, steps, subst):any {
                        var currStep = proof.steps[step];
                        var currExpr = currStep.getSentence();
                        var refExpr = proof.steps[steps[0]].getSentence();
                        if (currExpr[0] !== 'exists')
                            return "Exists-x-Intro: Current step is not an 'exists' expression.";

                        var refExprSub = this.substitute(refExpr, subst[1], subst[0]);
                        if (this.semanticEq(refExprSub, currExpr[2]))
                            return true;

                        return "Exists-x-Intro: Referenced step did not match current step after " + subst[1] + "/" + subst[0] + " substitution.";
                    }),
                ElimVerifier : new Justifier(
                    { StepRefs: ["num", "range"], Substitution: true },
                    function(proof, step, part, steps, subst):any {
                        var currStep = proof.steps[step];
                        var currExpr = currStep.getSentence();
                        var refExpr = proof.steps[steps[0]].getSentence();
                        var startStep = proof.steps[steps[1][0]];
                        var startExpr = startStep.getSentence();
                        var scope = startStep.getScope(); // ex: [['x0','x'], ['y0', 'y'], ...], LIFO
                        var endExpr = proof.steps[steps[1][1]].getSentence();
                        if (refExpr[0] !== 'exists')
                            return "Exists-x-Elim: Referenced step is not an 'exists' expression.";
                        if (scope.length == 0 || scope[scope.length - 1] == null)
                            return "Exists-x-Elim: Range must be within an assumption scope (e.g., an x0 box).";

                        // check whether substition matches ref line with current line
                        var scopeVars = scope[scope.length-1];
                        var refExprSub = this.substitute(refExpr[2], subst[0], subst[1]);
                        if (this.semanticEq(refExprSub, startExpr)) {
                            if (this.semanticEq(endExpr, currExpr))
                                return true;
                            return "Exists-x-Elim: assumption ending step does not match current step.";
                        }
                        return "Exists-x-Elim: assumption beginning step doesn't match ref step for " + scopeVars[0] + ".";
                    })
            },
            "=" : {
                Name : "Equality",
                Type : "normal",
                IntroVerifier : new Justifier(
                    { StepRefs : null }, // no params required
                    function(proof, step, part, steps):any {
                        var s = proof.steps[step].getSentence();
                        if (s[0] !== '=')
                            return "Equality-Intro: Current step is not an equality." + proof.steps[step].getSentence();

                        if (this.semanticEq(s[1], s[2]))
                            return true;

                        return "Equality-Intro: Left and right sides do not match.";
                    }),
                ElimVerifier : new Justifier(
                    { StepRefs: ["num", "num"] },
                    function(proof, step, part, steps):any {
                        var equalityExpr = proof.steps[steps[0]].getSentence();
                        var elimExpr = proof.steps[steps[1]].getSentence();
                        var proposedResult = proof.steps[step].getSentence();
                        if (equalityExpr[0] !== '=')
                            return "Equality-Elim: First referenced step is not an equality.";

                        if (!this.semanticEq(elimExpr, proposedResult, equalityExpr[1], equalityExpr[2]))
                            return "Equality-Elim: Does not result in current step.";

                        return true;
                    })
            }, */
        };

    }

export { FOLRulebookFactory }
