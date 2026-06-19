import {
  AIInfrastructureEventName,
  type EventBus,
} from "@/backend/modules/shared";
import { PersistAIInteractionEventHandler } from "./application/handlers/persist-ai-interaction-event.handler";
import { RecordAIInteractionEventUseCase } from "./application/use-cases/record-ai-interaction-event.use-case";
import { SupabaseAIInteractionEventRepository } from "./infrastructure/supabase-ai-interaction-event.repository";
import { SupabaseAIInteractionReviewRepository } from "./infrastructure/supabase-ai-interaction-review.repository";
import { ListAIInteractionsUseCase } from "./application/use-cases/list-ai-interactions.use-case";
import { ReviewAIInteractionUseCase } from "./application/use-cases/review-ai-interaction.use-case";

const repository = new SupabaseAIInteractionEventRepository();
const reviewRepository = new SupabaseAIInteractionReviewRepository();

export function createAIInteractionsModule(eventBus: EventBus) {
  if (!eventBus.subscribe) {
    throw new Error("AI interaction handlers require an event bus with subscriptions.");
  }
  const recordAIInteractionEvent = new RecordAIInteractionEventUseCase({ repository });
  const handler = new PersistAIInteractionEventHandler(
    recordAIInteractionEvent,
  );
  for (const eventName of Object.values(AIInfrastructureEventName)) {
    eventBus.subscribe(eventName, handler);
  }
  return {
    recordAIInteractionEvent,
    listAIInteractions: new ListAIInteractionsUseCase({
      eventRepository: repository,
      reviewRepository,
    }),
    reviewAIInteraction: new ReviewAIInteractionUseCase({ repository: reviewRepository }),
    bindRequest(client: Parameters<typeof repository.bindRequest>[0]) {
      repository.bindRequest(client);
      reviewRepository.bindRequest(client);
    },
  };
}
