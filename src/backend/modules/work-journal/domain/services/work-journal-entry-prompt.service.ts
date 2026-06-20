import type { DraftEntryInput } from "../repositories/journal-ai-service.repository";
import { WorkJournalEntryPrompt } from "./work-journal-entry.prompt";

export class WorkJournalEntryPromptService {
  private readonly prompt = new WorkJournalEntryPrompt();

  systemInstruction(): string {
    return this.prompt.systemInstruction();
  }

  build(input: DraftEntryInput): string {
    return this.prompt.build(input);
  }

  buildForClipboard(input: DraftEntryInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
