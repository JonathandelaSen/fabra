import {
  AIInfrastructureEventName,
  type EventBus,
} from "@/modules/shared";
import { PersistAIInteractionEventHandler } from "./application/handlers/persist-ai-interaction-event.handler";
import { RecordAIInteractionEventUseCase } from "./application/use-cases/record-ai-interaction-event.use-case";
import { SupabaseAIInteractionEventRepository } from "./infrastructure/supabase-ai-interaction-event.repository";

const repository = new SupabaseAIInteractionEventRepository();

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
    bindRequest: repository.bindRequest.bind(repository),
  };
}
