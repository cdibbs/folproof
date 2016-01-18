///<reference path='Proof.ts' />
///<reference path='Statement.ts' />;
///<reference path='JustificationFactory.ts' />
///<reference path='IJustificationFactory.ts' />
///<reference path='Justification.ts' />

import { JustificationFactory } from "./JustificationFactory";
import { Proof } from "./Proof";
import { Statement } from "./Statement";

/**
 * Given a proof represented as an Abstract Syntax Tree output by our parser,
 * preprocess it and return an object-oriented representation for consumption
 * by our verifier.
 */
class ProofFactory {
  private justificationFactory: IJustificationFactory = new JustificationFactory();
  /**
   * Preprocesses an AST into a Proof object. Among other things, it generates
   * variable scopes for assumption boxes.
   * @param ast   An Abstract Syntax Tree returned by the proof parser.
   * @return      An object of type Proof.
   */
  public preprocess(ast:any):Proof {
      var proof = new Proof();
      this.preprocessBox(proof, ast, 0, []);
      return proof;
  }

  private preprocessBox(proof:any, ast:any, step:number, scope:any):number {
    for(var i=0; i<ast.length; i++) {
      if (ast[i][0] === 'rule') {
        var justif = this.justificationFactory.buildFromASTFrag(ast[i][2]);
        proof.Steps[step] = new Statement(ast[i][1], justif, scope, ast[i][3], i == 0, i == ast.length - 1);
        step = step + 1;
      } else if (ast[i][0] === 'folbox') {
          var newScope = scope.slice(0)
          newScope.push(ast[i][2][1]);
          step = this.preprocessBox(proof, ast[i][1], step, newScope);
      } else if (ast[i][0] === 'box') {
          var newScope = scope.slice(0)
          newScope.push(null);
          step = this.preprocessBox(proof, ast[i][1], step, newScope);
      } else if (ast[i][0] === 'error') {
          proof.Steps[step] = ast[i];
      }
    }
    return step;
  }
}

export { ProofFactory }
