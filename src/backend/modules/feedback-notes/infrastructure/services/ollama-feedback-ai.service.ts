import { Ollama } from "ollama";
import type {
  FeedbackAIService,
  GenerateFinalFeedbackInput,
} from "../../domain/repositories/feedback-ai-service.repository";
import { FinalFeedbackText } from "../../domain/value-objects/final-feedback-text.value-object";
import { FeedbackNotesFinalPromptService } from "../../domain/services/feedback-notes-final-prompt.service";

const promptService = new FeedbackNotesFinalPromptService();
import { parseFinalFeedbackAIResponse } from "../../domain/services/feedback-ai-response-parser";

export class OllamaFeedbackAIService implements FeedbackAIService {
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generateFinalFeedback(
    input: GenerateFinalFeedbackInput
  ): Promise<FinalFeedbackText> {
    const ollama = new Ollama({ host: this.config.baseUrl || "http://localhost:11434" });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: promptService.build(input),
      system: promptService.systemInstruction(),
      format: "json",
    });

    return FinalFeedbackText.fromPrimitives(parseFinalFeedbackAIResponse(response.response || "{}"));
  }
}

export class OllamaFeedbackAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): FeedbackAIService {
    return new OllamaFeedbackAIService(config);
  }
}
