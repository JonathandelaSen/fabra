import { EntityId, LongText, ValueObject } from "@/backend/modules/shared";
import { CVChatSnapshot } from "./cv-chat-snapshot.value-object";

export interface CVChatContextPrimitives {
  cvId: string;
  cv: unknown;
  cvText: string | null;
}

export class CVChatContext extends ValueObject<CVChatContextPrimitives> {
  private constructor(
    private readonly cvIdValue: EntityId,
    private readonly cvSnapshot: CVChatSnapshot,
    private readonly cvTextValue: LongText | null
  ) {
    super();
  }

  static fromPrimitives(primitives: CVChatContextPrimitives): CVChatContext {
    return new CVChatContext(
      EntityId.fromPrimitives(primitives.cvId),
      CVChatSnapshot.fromPrimitives(primitives.cv),
      primitives.cvText === null ? null : LongText.fromPrimitives(primitives.cvText)
    );
  }

  get cvId(): string {
    return this.cvIdValue.toPrimitives();
  }

  get cv(): unknown {
    return this.cvSnapshot.toPrimitives();
  }

  get cvText(): string | null {
    return this.cvTextValue?.toPrimitives() ?? null;
  }

  toPrimitives(): CVChatContextPrimitives {
    return {
      cvId: this.cvIdValue.toPrimitives(),
      cv: this.cvSnapshot.toPrimitives(),
      cvText: this.cvTextValue?.toPrimitives() ?? null,
    };
  }
}
