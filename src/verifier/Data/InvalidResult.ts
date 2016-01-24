import { VerificationResult } from "./VerificationResult";

class InvalidResult extends VerificationResult {
    public constructor(message: string) {
        super(false, message);
    }
}

export { InvalidResult }