import { ValueObject } from "@/modules/shared";

export interface CVChatContextPrimitives {
  cvId: string;
  cv: unknown;
  cvText: string | null;
}

export class CVChatContext extends ValueObject<CVChatContextPrimitives> {
  private constructor(
    public readonly cvId: string,
    public readonly cv: unknown,
    public readonly cvText: string | null
  ) {
    super();
  }

  static fromPrimitives(primitives: CVChatContextPrimitives): CVChatContext {
    return new CVChatContext(
      primitives.cvId,
      primitives.cv,
      primitives.cvText
    );
  }

  toPrimitives(): CVChatContextPrimitives {
    return {
      cvId: this.cvId,
      cv: this.cv,
      cvText: this.cvText,
    };
  }
}
