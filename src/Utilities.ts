module Utilities {
export class Utility {
    constructor(
        public debugMode:boolean = true)
    {
    }

    debug() {
        if (this.debugMode)
           console.log.apply(console, Array.prototype.slice.call(arguments));
    }
}
}
