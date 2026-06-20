import { GoogleGenAI } from "@google/genai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  DraftEntryInput,
  JournalAIService,
} from "../../domain/repositories/journal-ai-service.repository";
import { WorkJournalFinalText } from "../../domain/value-objects/work-journal-final-text.value-object";
import { WorkJournalEntryPromptService } from "../../domain/services/work-journal-entry-prompt.service";

const promptService = new WorkJournalEntryPromptService();

export class GeminiJournalAIService implements JournalAIService {
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async draftEntry(input: DraftEntryInput): Promise<WorkJournalFinalText> {
    const googleAI = new GoogleGenAI({ apiKey: this.config.apiKey });
    const response = await googleAI.models.generateContent({
      model: this.config.model,
      contents: [
        {
          role: "user",
          parts: [{ text: promptService.build(input) }],
        },
      ],
      config: {
        systemInstruction: promptService.systemInstruction(),
        responseMimeType: "application/json",
      },
    });

    return this.parseResponse(response.text || "{}");
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

export class GeminiJournalAIServiceFactory {
  create(config: { apiKey?: string; model: string }): JournalAIService {
    if (!config.apiKey) throw badRequest("API key is required for Gemini.", ErrorCode.AI_API_KEY_REQUIRED);
    return new GeminiJournalAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
