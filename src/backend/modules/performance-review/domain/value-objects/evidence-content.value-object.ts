import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/modules/shared";

export class EvidenceContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): EvidenceContent {
    const trimmed = value.trim();
    if (!trimmed) throw new DomainError(ErrorCode.VALIDATION_FAILED, "Evidence content cannot be empty.");
    return new EvidenceContent(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
