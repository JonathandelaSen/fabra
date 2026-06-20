import OpenAI from "openai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  DraftEntryInput,
  JournalAIService,
} from "../../domain/repositories/journal-ai-service.repository";
import { WorkJournalFinalText } from "../../domain/value-objects/work-journal-final-text.value-object";
import { WorkJournalEntryPromptService } from "../../domain/services/work-journal-entry-prompt.service";

const promptService = new WorkJournalEntryPromptService();

export class OpenAIJournalAIService implements JournalAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async draftEntry(input: DraftEntryInput): Promise<WorkJournalFinalText> {
    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: promptService.systemInstruction() },
        { role: "user", content: promptService.build(input) },
      ],
      response_format: { type: "json_object" },
    });

    return this.parseResponse(response.choices[0]?.message.content || "{}");
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

export class OpenAIJournalAIServiceFactory {
  create(config: { apiKey?: string; model: string }): JournalAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAIJournalAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
