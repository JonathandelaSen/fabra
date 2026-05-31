import { Ollama } from "ollama";
import type {
  DraftEntryInput,
  JournalAIService,
} from "../../domain/repositories/journal-ai-service.repository";
import {
  buildWorkJournalEntryDraftPrompt,
  WORK_JOURNAL_ENTRY_SYSTEM_PROMPT,
} from "./work-journal-prompts";

export class OllamaJournalAIService implements JournalAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async draftEntry(input: DraftEntryInput): Promise<string> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: buildWorkJournalEntryDraftPrompt(input),
      system: WORK_JOURNAL_ENTRY_SYSTEM_PROMPT,
      format: "json",
    });

    return this.parseResponse(response.response || "{}");
  }

  private parseResponse(rawText: string): string {
    const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
    const finalText =
      typeof parsed.final_text === "string" && parsed.final_text.trim()
        ? parsed.final_text.trim()
        : null;
    if (!finalText) {
      throw new Error("The AI could not draft the entry with these notes.");
    }
    return finalText;
  }
}

export class OllamaJournalAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): JournalAIService {
    return new OllamaJournalAIService(config);
  }
}
