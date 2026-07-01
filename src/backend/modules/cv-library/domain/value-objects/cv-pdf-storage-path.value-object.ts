import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidCVPdfStoragePathError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_CV_PDF_STORAGE_PATH, "CV PDF storage path cannot be empty.", { value });
    this.name = "InvalidCVPdfStoragePathError";
  }
}

export class CVPdfStoragePath extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidCVPdfStoragePathError(value);
  }

  static fromPrimitives(value: string): CVPdfStoragePath {
    return new CVPdfStoragePath(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
