import { AggregateRoot } from "@/backend/modules/shared";

export interface AIInteractionEventPrimitives {
  id: string;
  interactionId: string;
  attemptId: string;
  eventName: string;
  userId: string;
  module: string;
  operation: string;
  entityType: string;
  entityId: string;
  assistanceMode: string;
  provider: string;
  model: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

export class AIInteractionEvent extends AggregateRoot {
  private constructor(private readonly primitives: AIInteractionEventPrimitives) {
    super();
  }

  static create(primitives: AIInteractionEventPrimitives): AIInteractionEvent {
    return new AIInteractionEvent(structuredClone(primitives));
  }

  static fromPrimitives(
    primitives: AIInteractionEventPrimitives,
  ): AIInteractionEvent {
    return new AIInteractionEvent(structuredClone(primitives));
  }

  get id(): string {
    return this.primitives.id;
  }

  toPrimitives(): AIInteractionEventPrimitives {
    return structuredClone(this.primitives);
  }
}
