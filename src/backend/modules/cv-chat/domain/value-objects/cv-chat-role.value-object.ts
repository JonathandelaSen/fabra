import { ValueObject } from "@/modules/shared";

export const cvChatRoles = {
  user: "user",
  assistant: "assistant",
} as const;

export type CVChatRolePrimitives =
  (typeof cvChatRoles)[keyof typeof cvChatRoles];

export class CVChatRole extends ValueObject<CVChatRolePrimitives> {
  private constructor(private readonly value: CVChatRolePrimitives) {
    super();
  }

  static fromPrimitives(value: string): CVChatRole {
    if (
      value !== cvChatRoles.user &&
      value !== cvChatRoles.assistant
    ) {
      throw new Error("Analysis chat role must be user or assistant.");
    }

    return new CVChatRole(value);
  }

  static user(): CVChatRole {
    return new CVChatRole(cvChatRoles.user);
  }

  static assistant(): CVChatRole {
    return new CVChatRole(cvChatRoles.assistant);
  }

  toPrimitives(): CVChatRolePrimitives {
    return this.value;
  }
}
