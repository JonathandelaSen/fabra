import type { WorkJournalContext } from "../entities/journal-context.entity";
import type { WorkJournalFinalText } from "../value-objects/work-journal-final-text.value-object";
import type { AIProvider } from "@/backend/modules/shared";

export interface DraftEntryInput {
  context: Pick<WorkJournalContext, "type" | "name" | "roleOrLabel">;
  dateStart: string;
  dateEnd?: string | null;
  topic?: string | null;
  notes: string;
}

export interface JournalAIService {
  draftEntry(input: DraftEntryInput): Promise<WorkJournalFinalText>;
}

export interface JournalAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): JournalAIService;
}
