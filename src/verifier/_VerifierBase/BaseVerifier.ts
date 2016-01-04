///<reference path='IRulebookFactory.ts' />
///<reference path='../Utilities.ts' />
///<reference path='VerificationResult.ts' />
///<reference path='Proof.ts' />
///<reference path='Statement.ts' />;
///<reference path='JustificationFactory' />
///<reference path='Justification' />

import { Statement } from "./Statement";
import { Proof } from "./Proof";
import { VerificationResult } from "./VerificationResult";
import { JustificationFactory } from "./JustificationFactory";

class BaseVerifier {
    public util:IUtility;
    public log:() => void;
    private rulebookFactory: IRulebookFactory;
    private rules:{ [id: string] : IRule };

    constructor(util: IUtility, rulebookFactory: IRulebookFactory, justificationFactory: IJustificationFactory)
    {
        this.util = util;
        this.log = util.debug;
        this.rulebookFactory = rulebookFactory;
    }

    public VerifyFromAST(ast: any): VerificationResult {
        var proof = this.Preprocess(ast);
        return this.Verify(proof);
    }

    public Verify(proof: Proof): VerificationResult {
        this.rules = this.rulebookFactory.BuildRulebook();
        for (var i=0; i<proof.Steps.length; i++) {
            result = this.ValidateStatement(proof, i);
            if (! result.Valid) {
                break;
            }
        }
        return new VerificationResult(true, "Proof is valid.");
    }

    private ValidateStatement(proof: Proof, step: number):VerificationResult {
        var stmt = proof.Steps[step];
        if (stmt[0] === 'error')
          return new VerificationResult(false, "Proof invalid due to syntax errors.", step + 1);

        var why = stmt.Justification;
        var newv = null;
        if (why[0].split('.').length == 2)
            newv = why[0].split('.')[1];
        var validator = this.LookupValidator(why);
        if (typeof validator === 'function') {
            var part = why[2], lines = why[3];
            var subst = null;
            if (newv && why[4]) subst = [newv, why[4]];
            var isValid = validator(proof, step, part, lines, subst);
            if (isValid === true) {
                currResult.Valid = true;
            } else {
                currResult.Valid = false;
                currResult.Message = isValid;
                currResult.ErrorStep = step + 1;
                currResult.ErrorMeta = stmt.Meta;
            }
            return currResult;
        } else if (typeof validator === "string") {
            currResult.Valid = false;
            currResult.Message = validator;
            currResult.ErrorStep = step + 1;
            currResult.ErrorMeta = stmt.Meta;
        }
        currResult.Valid = false;
        return currResult;
    }

    private LookupValidator(why:any) {
        var name = why[0].toLowerCase();
        if (name.split('.').length == 2)
            name = name.split('.')[0] + ".";
        var rule = this.rules[name];
        if (!rule) return "Cannot find rule: " + name;
        if (rule.Type === "simple" || rule.Type === "derived") {
            var fn = rule.SimpleVerifier;
            if (!fn) throw new Error("Not implemented for " + name);
            return fn.exec;
        }

        if (why[1]) {
            var elimOrIntro = why[1].toLowerCase();
            if ("introduction".indexOf(elimOrIntro) === 0) {
                var fn = rule.IntroVerifier;
                if (!fn) throw new Error("Not implemented for " + name);
                return fn.exec;
            } else if ("elimination".indexOf(elimOrIntro) === 0) {
                var fn = rule.ElimVerifier;
                if (!fn) throw new Error("Not implemented for " + name);
                return fn.exec;
            }
            return "Cannot determine elim/intro rule type from " + elimOrIntro;
        }

        return "Unrecognized rule: " + why[0] + " " + (why[1] ? why[1] : "")  + (why[2] ? why[2] : "") + " " + (why[3] ? why[3] : "");
    }

    /**
     * Preprocesses an AST into a Proof object. Among other things, it generates
     * variable scopes for assumption boxes.
     * @param ast   An Abstract Syntax Tree returned by the proof parser.
     * @return      An object of type Proof.
     */
    public Preprocess(ast:any):Proof {
        var proof = new Proof();
        this.PreprocessBox(proof, ast, 0, []);
        return proof;
    }

    private PreprocessBox(proof:any, ast:any, step:number, scope:any):number {
        for(var i=0; i<ast.length; i++) {
            if (ast[i][0] === 'rule') {
                proof.Steps[step] = new Statement(ast[i][1], ast[i][2], scope, ast[i][3], i == 0, i == ast.length - 1);
                step = step + 1;
            } else if (ast[i][0] === 'folbox') {
                var newScope = scope.slice(0)
                newScope.push(ast[i][2][1]);
                step = this.PreprocessBox(proof, ast[i][1], step, newScope);
            } else if (ast[i][0] === 'box') {
                var newScope = scope.slice(0)
                newScope.push(null);
                step = this.PreprocessBox(proof, ast[i][1], step, newScope);
            } else if (ast[i][0] === 'error') {
                proof.Steps[step] = ast[i];
            }
        }
        return step;
    }
}

export { BaseVerifier };

/*module.exports = {
    Verifier : Verifier
};
*/
