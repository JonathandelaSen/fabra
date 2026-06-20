import { Ollama } from "ollama";
import type {
  DraftEntryInput,
  JournalAIService,
} from "../../domain/repositories/journal-ai-service.repository";
import { WorkJournalFinalText } from "../../domain/value-objects/work-journal-final-text.value-object";
import { WorkJournalEntryPromptService } from "../../domain/services/work-journal-entry-prompt.service";

const promptService = new WorkJournalEntryPromptService();

export class OllamaJournalAIService implements JournalAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async draftEntry(input: DraftEntryInput): Promise<WorkJournalFinalText> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: promptService.build(input),
      system: promptService.systemInstruction(),
      format: "json",
    });

    return this.parseResponse(response.response || "{}");
  }

  private parseResponse(rawText: string): WorkJournalFinalText {
    const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
    const finalText =
      typeof parsed.final_text === "string" && parsed.final_text.trim()
        ? parsed.final_text.trim()
        : null;
    if (!finalText) {
      throw new Error("The AI could not draft the entry with these notes.");
    }
    return WorkJournalFinalText.fromPrimitives(finalText);
  }
}

export class OllamaJournalAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): JournalAIService {
    return new OllamaJournalAIService(config);
  }
}
