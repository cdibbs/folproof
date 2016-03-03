///<reference path="../_VerifierBase/IRule.ts" />
///<reference path="../_VerifierBase/IReasonFormat.ts" />

class RuleBase implements IRule {
    public get Name(): string { return "RuleBase" }
    public get Type(): string { return null; }
    public ReasonFormat(type: string): IReasonFormat {
        throw new Error(`Unimplemented for rule ${this.Name}`);
    }

    Exec(proof: IProof, step: number, partRef: number, stepRefs: number[][], ...args: any[]): IVerificationResult {
        throw new Error(`Unimplemented for rule ${this.Name}`);
    }

    substitute(startExpr, a, b, bound?) {
        //this.debug("substitute", startExpr, a, b);
        bound = bound ? bound : [];
        var binOps = ["->", "and", "or", "<->", "="];
        var unOps = ["not", "forall", "exists"];

        // remove parens, which are basically stylistic no-ops
        while (startExpr[0] === 'paren') startExpr = startExpr[1];

        if (this.arrayContains(binOps, startExpr[0])) {
            var leftSide = this.substitute(startExpr[1], a, b);
            var rightSide = this.substitute(startExpr[2], a, b);
            return [startExpr[0], leftSide, rightSide];
        } else if (this.arrayContains(unOps, startExpr[0])) {
            if (startExpr[0] === "forall" || startExpr[0] === "exists") {
                bound = bound.slice(0);
                bound.push(startExpr[1]);
                return [startExpr[0], startExpr[1],
                    this.substitute(startExpr[2], a, b, bound)];
            }

            return [startExpr[0], this.substitute(startExpr[1], a, b, bound)];
        } else if (startExpr[0] === 'id') {
            if (startExpr.length === 2) { // our loverly base case
                if (! this.arrayContains(bound, startExpr[1])) {
                    if (startExpr[1] === a)
                        return [startExpr[0], b];
                }
                return startExpr;
            }
            if (startExpr.length === 3) {
                var newTerms = [];
                for (var i=0; i<startExpr[2].length; i++) {
                    newTerms.push(this.substitute(startExpr[2][i], a, b, bound));
                }
                return [startExpr[0], startExpr[1], newTerms];
            }
            throw Error("Unexpected AST format.");
        }
    }

    /**
     * Determines whether two expressions are semantically equivalent
     * under the given (and optional) substitution.
     * a, b - abstract syntax trees of the expressions to be compared.
     * suba, subb (optional) - does comparison after substituting suba in a with subb.
     */
    semanticEq(A, B, suba?, subb?): boolean {
        //this.debug("semanticEq", A, B);
        var bound = {}, sub;
        if (suba) {
            return this._recSemanticEq(true, suba, subb, A, B, {});
        } else {
            return this._recSemanticEq(false, suba, subb, A, B);
        }
    }

    _recSemanticEq(sub, suba, subb, a, b, bound?): boolean {
        var binOps = ["->", "and", "or", "<->", "="];
        var unOps = ["not"];

        // if eq w/substitution, return true, otherwise continue
        if (sub && this.semanticEq(a, suba)) {
                if ((a[0] !== 'id' || !bound[a[1]]) && this._recSemanticEq(sub, suba, subb, subb, b, bound)) return true;
        }

        if (this.arrayContains(binOps, a[0]) && a[0] === b[0]) {
            if (this._recSemanticEq(sub, suba, subb, a[1], b[1], bound) && this._recSemanticEq(sub, suba, subb, a[2], b[2], bound)) {
                return true;
            }
            return false;
        } else if (this.arrayContains(unOps, a[0]) && a[0] === b[0]) {
            if (this._recSemanticEq(sub, suba, subb, a[1], b[1], bound)) {
                return true;
            }
            return false;
        } else if (a[0] === 'exists' || a[0] === 'forall' && a[0] === b[0]) {
            var newb;
            if (sub) {
                newb = this.clone(bound);
                newb[a[1]] = true;
            }
            if (this._recSemanticEq(sub, suba, subb, a[2], b[2], newb)) {
                return true;
            }
            return false;
        } else if (a[0] === "id") {
            if (b && a[1] !== b[1]) return false;
            if (a.length == 2 && b.length == 2) {
                return true;
            }

            if (a.length == 3 && b.length == 3) {
                if (a[2].length != b[2].length) {
                    return false;
                }
                for (var i=0; i<a[2].length; i++) {
                    if (!this._recSemanticEq(sub, suba, subb, a[2][i], b[2][i], bound)) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    isContradiction(s): boolean {
        return (s[0] === 'id' && (s[1] === '_|_' || s[1] === 'contradiction'));
    }

    arrayContains(arr, el): boolean {
        for (var i=0; i<arr.length; i++) {
            if (arr[i] === el) return true;
        }
        return false;
    }

    clone(obj): any {
        var newo = {};
        for(var k in Object.keys(obj)) {
            newo[k] = obj[k];
        }
        return newo;
    }
}

export { RuleBase }
