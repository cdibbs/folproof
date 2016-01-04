
class Utility {
    constructor(
        public debugMode:boolean = true)
    {
    }

    debug(...args: any[]): void {
        if (this.debugMode)
           console.log.apply(console, Array.prototype.slice.call(arguments));
    }
}

interface IUtility {
  debugMode:boolean;

  debug(...args: any[]): void;
}
