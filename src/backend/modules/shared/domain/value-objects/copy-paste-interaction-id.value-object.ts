import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidCopyPasteInteractionIdError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_INTERACTION_ID, "Copy paste interactionId cannot be empty when present.", { value });
    this.name = "InvalidCopyPasteInteractionIdError";
  }
}

export class CopyPasteInteractionId extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): CopyPasteInteractionId {
    if (value === null) return new CopyPasteInteractionId(null);
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidCopyPasteInteractionIdError(value);
    return new CopyPasteInteractionId(trimmed);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
