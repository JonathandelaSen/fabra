import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/backend/modules/shared";

export class InvalidEvidenceContentError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_EVIDENCE_CONTENT, "Evidence content cannot be empty.", { value });
    this.name = "InvalidEvidenceContentError";
  }
}

export class EvidenceContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): EvidenceContent {
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidEvidenceContentError(value);
    return new EvidenceContent(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
