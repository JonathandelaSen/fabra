import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidCVChatTitleError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_CV_CHAT_TITLE, "Analysis chat title cannot be empty.", { value });
    this.name = "InvalidCVChatTitleError";
  }
}

export class CVChatTitle extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidCVChatTitleError(value);
  }

  static fromPrimitives(value: string): CVChatTitle {
    return new CVChatTitle(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
