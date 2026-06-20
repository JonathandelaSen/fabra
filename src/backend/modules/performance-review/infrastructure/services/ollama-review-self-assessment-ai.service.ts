import { Ollama } from "ollama";
import type {
  ReviewSelfAssessmentAIInput,
  ReviewSelfAssessmentAIService,
} from "../../domain/repositories/review-self-assessment-ai.service";
import {
  buildSelfAssessmentSystemPrompt,
  buildSelfAssessmentUserPrompt,
} from "../../domain/services/review-self-assessment-prompts";

export class OllamaReviewSelfAssessmentAIService
  implements ReviewSelfAssessmentAIService
{
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generate(input: ReviewSelfAssessmentAIInput): Promise<string> {
    const ollama = new Ollama({
      host: this.config.baseUrl || "http://localhost:11434",
    });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: buildSelfAssessmentUserPrompt(input),
      system: buildSelfAssessmentSystemPrompt(),
    });

    const content = (response.response || "").trim();
    if (!content) {
      throw new Error("The AI could not generate the self-assessment.");
    }
    return content;
  }
}

export class OllamaReviewSelfAssessmentAIServiceFactory {
  create(config: {
    baseUrl?: string;
    model: string;
  }): ReviewSelfAssessmentAIService {
    return new OllamaReviewSelfAssessmentAIService(config);
  }
}
