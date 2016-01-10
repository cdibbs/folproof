///<reference path="IJustification.ts" />

interface IJustificationFactory {
  buildFromASTFrag(ast: any): IJustification;
  parseJustification(why: string): string[];
}
