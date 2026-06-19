import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/modules/shared";
import { CreateReceivedFeedbackUseCase } from "./application/use-cases/create-received-feedback.use-case";
import { DeleteReceivedFeedbackUseCase } from "./application/use-cases/delete-received-feedback.use-case";
import { ListReceivedFeedbackUseCase } from "./application/use-cases/list-received-feedback.use-case";
import { ListReceivedFeedbackInRangeUseCase } from "./application/use-cases/list-received-feedback-in-range.use-case";
import { UpdateReceivedFeedbackUseCase } from "./application/use-cases/update-received-feedback.use-case";
import { SupabaseReceivedFeedbackRepository } from "./infrastructure/repositories/supabase-received-feedback.repository";

const receivedFeedbackRepo = new SupabaseReceivedFeedbackRepository();

function createUseCases(eventBus: EventBus) {
  return {
    listReceivedFeedback: new ListReceivedFeedbackUseCase({ receivedFeedbackRepo }),
    listReceivedFeedbackInRange: new ListReceivedFeedbackInRangeUseCase({
      receivedFeedbackRepo,
    }),
    createReceivedFeedback: new CreateReceivedFeedbackUseCase({
      receivedFeedbackRepo,
      eventBus,
    }),
    updateReceivedFeedback: new UpdateReceivedFeedbackUseCase({
      receivedFeedbackRepo,
      eventBus,
    }),
    deleteReceivedFeedback: new DeleteReceivedFeedbackUseCase({
      receivedFeedbackRepo,
      eventBus,
    }),
  };
}

export type ReceivedFeedbackModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): ReceivedFeedbackModule;
};

export function createReceivedFeedbackModule(telemetry: Telemetry, eventBus: EventBus): ReceivedFeedbackModule {
  const useCases = instrumentUseCases("received-feedback", createUseCases(eventBus), telemetry);

  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      receivedFeedbackRepo.bindRequest(client);
      return this;
    },
  };
}
