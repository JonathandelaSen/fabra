import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidCVDocumentNameError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_CV_DOCUMENT_NAME, "CV document name is required", { value });
    this.name = "InvalidCVDocumentNameError";
  }
}

export class CVDocumentName extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidCVDocumentNameError(value);
  }

  static fromPrimitives(value: string): CVDocumentName {
    return new CVDocumentName(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
