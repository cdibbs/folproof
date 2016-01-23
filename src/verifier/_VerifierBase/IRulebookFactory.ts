///<reference path="IRule.ts" />

  interface IRulebookFactory {
    FetchRule(name: string): IRule;
    BuildRulebook(): { [id: string] : IRule };
  }
