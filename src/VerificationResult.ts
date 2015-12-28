class VerificationResult {
  constructor(
      public Valid:boolean = false,
      public Message:string = "",
      public ErrorStep:number = -1,
      public ErrorMeta:any = null)
  {
  }
}
