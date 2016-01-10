///<reference path="IRule.ts"/>
/**
 * Manages a list of rules that can be used to justify proof steps.
 */
interface IRulebook {
  add(key: string, value: IRule): void;
  remove(key: string): boolean;
  containsKey(key: string): boolean;
  changeValueForKey(key: string, newValue: IRule): void;
  keys: string[];
  dict: { [id: string]: IRule };
  count: number;
}
