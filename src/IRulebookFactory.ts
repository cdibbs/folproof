///<reference path="Rule.ts" />
module Verifier {
    export interface IRulebookFactory {
        BuildRulebook(): { [id: string] : IRule };
    }
}
