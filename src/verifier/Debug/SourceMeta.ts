///<reference path="ISourceMeta.ts" />

class SourceMeta implements ISourceMeta {
  private _raw: any;

  public SourceMeta(raw: any) {
    this._raw = raw;
  }

  public _Raw(): any { return this._raw; }
}

export { SourceMeta }
