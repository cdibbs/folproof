import { VerificationResult } from "./VerificationResult";

class ValidResult extends VerificationResult {
    public constructor(message: string = "Result is valid.") {
        super(true, message);
    }
}

export { ValidResult }