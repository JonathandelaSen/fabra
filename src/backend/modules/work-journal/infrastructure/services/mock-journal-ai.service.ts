import type {
  DraftEntryInput,
  JournalAIService,
} from "../../domain/repositories/journal-ai-service.repository";
import { WorkJournalFinalText } from "../../domain/value-objects/work-journal-final-text.value-object";

class MockJournalAIService implements JournalAIService {
  async draftEntry(input: DraftEntryInput): Promise<WorkJournalFinalText> {
    return WorkJournalFinalText.fromPrimitives(
      `${input.topic ?? input.context.name}: ${input.notes}`,
    );
  }
}

export class MockJournalAIServiceFactory {
  create(): JournalAIService {
    return new MockJournalAIService();
  }
}
