import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidCopyPasteAttemptIdError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_ATTEMPT_ID, "Copy paste attemptId cannot be empty when present.", { value });
    this.name = "InvalidCopyPasteAttemptIdError";
  }
}

export class CopyPasteAttemptId extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): CopyPasteAttemptId {
    if (value === null) return new CopyPasteAttemptId(null);
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidCopyPasteAttemptIdError(value);
    return new CopyPasteAttemptId(trimmed);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
