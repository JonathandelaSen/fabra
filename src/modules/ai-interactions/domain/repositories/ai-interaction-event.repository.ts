import type { AIInteractionEvent } from "../entities/ai-interaction-event.entity";
import type { UserId } from "@/modules/shared";

export interface AIInteractionEventRepository {
  save(event: AIInteractionEvent): Promise<AIInteractionEvent>;
  searchByUser(userId: UserId): Promise<AIInteractionEvent[]>;
}
