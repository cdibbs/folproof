/// <reference path="IRulebook" />
/// <reference path="IRule" />

/**
 * Manages a list of rules that can be used to justify proof steps.
 */
class Rulebook implements IRulebook {
  private _dict: { [id: string]: IRule };

  public constructor() {
    _dict = <{[id: string]: IRule}> {};
  }

  public constructor(rawDict: { [id: string]: IRule } ) {
    _dict = rawDict;
  }

  public add(key: string, value: IRule): void {
    if (! _dict[key])
      _dict[key] = value;
    else
      throw new Error("Rule already exists in book.");
  }

  public remove(key: string): boolean {
    if (! _dict[key])
      throw new Error("Rule does not exist in book.");

    delete _dict[key];
  }

  containsKey(key: string): boolean {
    return void 0 === _dict[key];
  }

  changeValueForKey(key: string, newValue: IRule): void {
    _dict[key] = newValue;
  }

  public get keys(): string[] => Object.keys(_dict);
  public get dict(): { [id: string]: IRule } => _dict;
  public get count(): number => this.keys.length;
}

export { Rulebook }
