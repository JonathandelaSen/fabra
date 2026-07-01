import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class InvalidCVChatContentError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_CV_CHAT_CONTENT, "Analysis chat content cannot be empty.", { value });
    this.name = "InvalidCVChatContentError";
  }
}

export class CVChatContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim())
      throw new InvalidCVChatContentError(value);
  }

  static fromPrimitives(value: string): CVChatContent {
    return new CVChatContent(value.trim());
  }

  toPrimitives(): string {
    return this.value;
  }
}
