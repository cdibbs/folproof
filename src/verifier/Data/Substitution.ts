///<reference path="ISubstitution.ts" />

class Substitution implements ISubstitution {
  private left: string;
  private right: string;

  public constructor(left: string, right: string) {
    this.left = left;
    this.right = right;
  }

  get Right(): string { return this.right; }
  get Left(): string { return this.left; }
}

export { Substitution }
