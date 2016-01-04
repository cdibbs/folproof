/**
 * Manages a list of rules that can be used to justify proof steps.
 */
interface IRulebook {
  add(key: string, value: IRule): void;
  remove(key: T): boolean;
  containsKey(key: T): boolean;
  changeValueForKey(key: T, newValue: U): void;
  keys: string[];
  dict: { [id: string]: IRule };
  count: number;
}
