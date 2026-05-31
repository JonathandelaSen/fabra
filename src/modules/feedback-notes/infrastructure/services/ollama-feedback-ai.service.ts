import { Ollama } from "ollama";
import type {
  FeedbackAIService,
  GenerateFinalFeedbackInput,
} from "../../domain/repositories/feedback-ai-service.repository";
import {
  buildFeedbackNotesFinalPrompt,
  FEEDBACK_NOTES_FINAL_SYSTEM_PROMPT,
} from "../../domain/services/feedback-notes-prompts";
import { parseFinalFeedbackAIResponse } from "./feedback-ai-response-parser";

export class OllamaFeedbackAIService implements FeedbackAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generateFinalFeedback(
    input: GenerateFinalFeedbackInput
  ): Promise<string> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: buildFeedbackNotesFinalPrompt(input),
      system: FEEDBACK_NOTES_FINAL_SYSTEM_PROMPT,
      format: "json",
    });

    return parseFinalFeedbackAIResponse(response.response || "{}");
  }
}

export class OllamaFeedbackAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): FeedbackAIService {
    return new OllamaFeedbackAIService(config);
  }
}
