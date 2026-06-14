import { ValueObject } from "@/modules/shared";

export type CVChatRolePrimitives = "user" | "assistant";

export class CVChatRole extends ValueObject<CVChatRolePrimitives> {
  private constructor(private readonly value: CVChatRolePrimitives) {
    super();
  }

  static fromPrimitives(value: string): CVChatRole {
    if (value !== "user" && value !== "assistant") {
      throw new Error("Analysis chat role must be user or assistant.");
    }

    return new CVChatRole(value);
  }

  static user(): CVChatRole {
    return new CVChatRole("user");
  }

  static assistant(): CVChatRole {
    return new CVChatRole("assistant");
  }

  toPrimitives(): CVChatRolePrimitives {
    return this.value;
  }
}
