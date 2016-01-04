///<reference path="IRule.ts" />

  interface IRulebookFactory {
      BuildRulebook(): { [id: string] : IRule };
  }
