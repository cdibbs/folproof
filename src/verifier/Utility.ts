
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

export { Utility }
