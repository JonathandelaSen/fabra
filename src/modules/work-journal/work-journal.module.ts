import { OllamaJournalAIServiceFactory } from "./infrastructure/services/ollama-journal-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/modules/shared";
import { SupabaseWorkJournalEntryRepository } from "./infrastructure/repositories/supabase-work-journal-entry.repository";
import { GeminiJournalAIServiceFactory } from "./infrastructure/services/gemini-journal-ai.service";
import { MockJournalAIServiceFactory } from "./infrastructure/services/mock-journal-ai.service";
import { OpenAIJournalAIServiceFactory } from "./infrastructure/services/openai-journal-ai.service";
import { ProviderJournalAIServiceFactory } from "./infrastructure/services/provider-journal-ai-service.factory";
import { ListEntriesUseCase } from "./application/use-cases/list-entries.use-case";
import { CreateEntryUseCase } from "./application/use-cases/create-entry.use-case";
import { UpdateEntryUseCase } from "./application/use-cases/update-entry.use-case";
import { DeleteEntryUseCase } from "./application/use-cases/delete-entry.use-case";
import { DraftEntryUseCase } from "./application/use-cases/draft-entry.use-case";
import { ListJournalEntriesInRangeUseCase } from "./application/use-cases/list-journal-entries-in-range.use-case";

const entryRepo = new SupabaseWorkJournalEntryRepository();
const aiFactory = new ProviderJournalAIServiceFactory({
  geminiFactory: new GeminiJournalAIServiceFactory(),
  openaiFactory: new OpenAIJournalAIServiceFactory(),
  mockFactory: new MockJournalAIServiceFactory(),
  ollamaFactory: new OllamaJournalAIServiceFactory(),
});

function createUseCases(eventBus: EventBus) {
  return {
    listEntries: new ListEntriesUseCase({ entryRepo }),
    createEntry: new CreateEntryUseCase({ entryRepo, eventBus }),
    updateEntry: new UpdateEntryUseCase({ entryRepo, eventBus }),
    deleteEntry: new DeleteEntryUseCase({ entryRepo, eventBus }),
    draftEntry: new DraftEntryUseCase({ aiFactory }),
    listJournalEntriesInRange: new ListJournalEntriesInRangeUseCase({
      entryRepo,
    }),
  };
}

export type WorkJournalModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): WorkJournalModule;
};

export function createWorkJournalModule(telemetry: Telemetry, eventBus: EventBus): WorkJournalModule {
  const useCases = instrumentUseCases("work-journal", createUseCases(eventBus), telemetry);

  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      entryRepo.bindRequest(client);
      return this;
    },
  };
}
