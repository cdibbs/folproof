///<reference path="IScope.ts" />

class Scope implements IScope {
  private _id: string;
  private _children: IScope[];
  private v: string;

  public constructor(
    private _parent: IScope,
    private _depth: number,
    private _alias: string = "",
    v: string = null)
  {
    this._id = this.generateUUID();
    this._children = new Array<IScope>();
    this.v = v;
  }

  public createChildScope(alias: string, v: string) {
    var child = new Scope(this, this.depth + 1, alias, v);
    this._children.push(child);
    return child;
  }

  public get depth(): number { return this._depth; }
  public get id(): string { return this._id; }
  public get abbrId(): string { return this._id.substr(-12); }
  public get alias(): string { return this._alias; }
  public get children(): IScope[] { return this._children; }
  public get hasVariable(): boolean { return !!this.v; }
  public get variable(): string { return this.v; }
  public get hasParent(): boolean { return this._parent != null; }
  public get parent(): IScope { return this._parent; }
  public get hasAncestorVariable(): boolean {
    var cur:IScope = this;
    while (!cur.hasVariable && cur.hasParent) cur = cur.parent;
    return cur.hasVariable;
  }
  public get ancestorVariable(): string {
    var cur:IScope = this;
    while (!cur.hasVariable && cur.hasParent) cur = cur.parent;
    return cur.variable;
  }

  public ancestorVariableMatch(testVar: string): boolean {
    var cur:IScope = this;
    while (!cur.hasVariable && cur.variable !== testVar && cur.hasParent) cur = cur.parent;
    return cur.variable === testVar;
  }

  // quickie from http://stackoverflow.com/a/8809472
  private generateUUID(){
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
  }

  public toString(): string { return `(depth ${this._depth}) ${this.alias}/${this.abbrId}`; }
}

export { Scope }
