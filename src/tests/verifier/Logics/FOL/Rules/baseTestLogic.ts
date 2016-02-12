///<reference path="../../../../../../typings/tsd.d.ts"/>
import { FOLVerifier } from "../../../../../verifier/Verifiers";
import { ProofFactory } from "../../../../../verifier/ProofFactory/ProofFactory";
import { FOL, PL } from "../../../../../parsers/Parsers";

function verifyProof(src: string) {
  var proof = fetchProof(src);
  return new FOLVerifier().Verify(proof);
}

function fetchProof(src: string) {
  var ast = new FOL.Parser().parse(src);
  var proof = new ProofFactory().preprocess(ast);
  return proof;
}

export { verifyProof, fetchProof }
