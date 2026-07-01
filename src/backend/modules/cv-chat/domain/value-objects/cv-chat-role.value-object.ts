import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const cvChatRoles = {
  user: "user",
  assistant: "assistant",
} as const;

export type CVChatRolePrimitives =
  (typeof cvChatRoles)[keyof typeof cvChatRoles];

export class InvalidCVChatRoleError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_CV_CHAT_ROLE, "Analysis chat role must be user or assistant.", { value });
    this.name = "InvalidCVChatRoleError";
  }
}

export class CVChatRole extends ValueObject<CVChatRolePrimitives> {
  private constructor(private readonly value: CVChatRolePrimitives) {
    super();
  }

  static fromPrimitives(value: string): CVChatRole {
    if (
      value !== cvChatRoles.user &&
      value !== cvChatRoles.assistant
    ) {
      throw new InvalidCVChatRoleError(value);
    }

    return new CVChatRole(value);
  }

  static user(): CVChatRole {
    return new CVChatRole(cvChatRoles.user);
  }

  static assistant(): CVChatRole {
    return new CVChatRole(cvChatRoles.assistant);
  }

  isUser(): boolean {
    return this.value === cvChatRoles.user;
  }

  isAssistant(): boolean {
    return this.value === cvChatRoles.assistant;
  }

  toPrimitives(): CVChatRolePrimitives {
    return this.value;
  }
}
