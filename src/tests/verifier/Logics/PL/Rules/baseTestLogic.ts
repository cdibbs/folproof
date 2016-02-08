///<reference path="../../../../../../typings/tsd.d.ts"/>
import { PLVerifier } from "../../../../../verifier/Verifiers";
import { ProofFactory } from "../../../../../verifier/ProofFactory/ProofFactory";
import { FOL, PL } from "../../../../../parsers/Parsers";

function verifyProof(src: string) {
  var proof = fetchProof(src);
  return new PLVerifier().Verify(proof);
}

function fetchProof(src: string) {
  var ast = new PL.Parser().parse(src);
  var proof = new ProofFactory().preprocess(ast);
  return proof;
}

export { verifyProof, fetchProof }
