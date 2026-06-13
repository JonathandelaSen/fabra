import type { AIInteractionEvent } from "../entities/ai-interaction-event.entity";

export interface AIInteractionEventRepository {
  save(event: AIInteractionEvent): Promise<AIInteractionEvent>;
}
