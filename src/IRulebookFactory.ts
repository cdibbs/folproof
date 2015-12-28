///<reference path="Rule.ts" />

  interface IRulebookFactory {
      BuildRulebook(): { [id: string] : IRule };
  }
