///<reference path="IVerificationResult.ts" />

class VerificationResult implements IVerificationResult {
  constructor(
      public Valid:boolean = false,
      public Message:string = "",
      public ErrorStep:number = -1,
      public ErrorMeta:any = null)
  {
  }
}

export { VerificationResult }
