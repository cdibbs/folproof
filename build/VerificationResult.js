var VerificationResult = (function () {
    function VerificationResult(Valid, Message, ErrorStep, ErrorMeta) {
        if (Valid === void 0) { Valid = false; }
        if (Message === void 0) { Message = ""; }
        if (ErrorStep === void 0) { ErrorStep = -1; }
        if (ErrorMeta === void 0) { ErrorMeta = null; }
        this.Valid = Valid;
        this.Message = Message;
        this.ErrorStep = ErrorStep;
        this.ErrorMeta = ErrorMeta;
    }
    return VerificationResult;
})();
//# sourceMappingURL=VerificationResult.js.map