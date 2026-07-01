import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidCopyPastePrivacyNoticeError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_PRIVACY_NOTICE, "Copy paste privacy notice cannot be empty when present.", { value });
    this.name = "InvalidCopyPastePrivacyNoticeError";
  }
}

export class CopyPastePrivacyNotice extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): CopyPastePrivacyNotice {
    if (value === null) return new CopyPastePrivacyNotice(null);
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidCopyPastePrivacyNoticeError(value);
    return new CopyPastePrivacyNotice(trimmed);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
