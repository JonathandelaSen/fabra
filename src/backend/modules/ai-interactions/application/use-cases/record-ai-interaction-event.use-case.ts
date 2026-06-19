import { AIInteractionEvent, type AIInteractionEventPrimitives } from "../../domain/entities/ai-interaction-event.entity";
import type { AIInteractionEventRepository } from "../../domain/repositories/ai-interaction-event.repository";

export type RecordAIInteractionEventInput = AIInteractionEventPrimitives;

export class RecordAIInteractionEventUseCase {
  constructor(
    private readonly deps: { repository: AIInteractionEventRepository },
  ) {}

  async execute(input: RecordAIInteractionEventInput): Promise<AIInteractionEvent> {
    return this.deps.repository.save(AIInteractionEvent.create(input));
  }
}
