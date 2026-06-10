import { OllamaFeedbackAIServiceFactory } from "./infrastructure/services/ollama-feedback-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/modules/shared";
import { CreateEntryUseCase } from "./application/use-cases/create-entry.use-case";
import { CreateFeedbackUseCase } from "./application/use-cases/create-feedback.use-case";
import { DeleteEntryUseCase } from "./application/use-cases/delete-entry.use-case";
import { DeleteFeedbackUseCase } from "./application/use-cases/delete-feedback.use-case";
import { GenerateFinalFeedbackUseCase } from "./application/use-cases/generate-final-feedback.use-case";
import { ListEntriesUseCase } from "./application/use-cases/list-entries.use-case";
import { ListFeedbacksUseCase } from "./application/use-cases/list-feedbacks.use-case";
import { CloseFeedbackUseCase } from "./application/use-cases/close-feedback.use-case";
import { ReopenFeedbackUseCase } from "./application/use-cases/reopen-feedback.use-case";
import { UpdateEntryUseCase } from "./application/use-cases/update-entry.use-case";
import { UpdateFeedbackUseCase } from "./application/use-cases/update-feedback.use-case";
import { GetFeedbackUseCase } from "./application/use-cases/get-feedback.use-case";
import { SupabaseFeedbackEntryRepository } from "./infrastructure/repositories/supabase-feedback-entry.repository";
import { SupabaseFeedbackRepository } from "./infrastructure/repositories/supabase-feedback.repository";
import { GeminiFeedbackAIServiceFactory } from "./infrastructure/services/gemini-feedback-ai.service";
import { MockFeedbackAIServiceFactory } from "./infrastructure/services/mock-feedback-ai.service";
import { OpenAIFeedbackAIServiceFactory } from "./infrastructure/services/openai-feedback-ai.service";
import { ProviderFeedbackAIServiceFactory } from "./infrastructure/services/provider-feedback-ai-service.factory";

const feedbackRepo = new SupabaseFeedbackRepository();
const entryRepo = new SupabaseFeedbackEntryRepository();
const aiFactory = new ProviderFeedbackAIServiceFactory({
  geminiFactory: new GeminiFeedbackAIServiceFactory(),
  openaiFactory: new OpenAIFeedbackAIServiceFactory(),
  mockFactory: new MockFeedbackAIServiceFactory(),
  ollamaFactory: new OllamaFeedbackAIServiceFactory(),
});

function createUseCases(eventBus: EventBus) {
  return {
    listFeedbacks: new ListFeedbacksUseCase({ feedbackRepo }),
    getFeedback: new GetFeedbackUseCase({ feedbackRepo }),
    createFeedback: new CreateFeedbackUseCase({ feedbackRepo, eventBus }),
    updateFeedback: new UpdateFeedbackUseCase({ feedbackRepo, eventBus }),
    closeFeedback: new CloseFeedbackUseCase({ feedbackRepo, eventBus }),
    reopenFeedback: new ReopenFeedbackUseCase({ feedbackRepo, eventBus }),
    deleteFeedback: new DeleteFeedbackUseCase({ feedbackRepo, eventBus }),
    listEntries: new ListEntriesUseCase({ feedbackRepo, entryRepo }),
    createEntry: new CreateEntryUseCase({ feedbackRepo, entryRepo, eventBus }),
    updateEntry: new UpdateEntryUseCase({ feedbackRepo, entryRepo, eventBus }),
    deleteEntry: new DeleteEntryUseCase({ feedbackRepo, entryRepo, eventBus }),
    generateFinalFeedback: new GenerateFinalFeedbackUseCase({
      feedbackRepo,
      entryRepo,
      aiFactory,
      eventBus,
    }),
  };
}

export type FeedbackNotesModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): FeedbackNotesModule;
};

export function createFeedbackNotesModule(telemetry: Telemetry, eventBus: EventBus): FeedbackNotesModule {
  const useCases = instrumentUseCases("feedback-notes", createUseCases(eventBus), telemetry);

  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      feedbackRepo.bindRequest(client);
      entryRepo.bindRequest(client);
      return this;
    },
  };
}
