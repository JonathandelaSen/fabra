import { Ollama } from "ollama";
import type {
  ReviewSelfAssessmentAIInput,
  ReviewSelfAssessmentAIService,
} from "../../domain/repositories/review-self-assessment-ai.service";
import { SelfAssessmentContent } from "../../domain/value-objects/self-assessment-content.value-object";
import { ReviewSelfAssessmentPromptService } from "../../domain/services/review-self-assessment-prompt.service";

const promptService = new ReviewSelfAssessmentPromptService();

export class OllamaReviewSelfAssessmentAIService
  implements ReviewSelfAssessmentAIService
{
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generate(input: ReviewSelfAssessmentAIInput): Promise<SelfAssessmentContent> {
    const ollama = new Ollama({
      host: this.config.baseUrl || "http://localhost:11434",
    });
    const response = await ollama.generate({
      stream: false,
      model: this.config.model,
      prompt: promptService.build(input),
      system: promptService.systemInstruction(),
    });

    const content = (response.response || "").trim();
    if (!content) {
      throw new Error("The AI could not generate the self-assessment.");
    }
    return SelfAssessmentContent.fromPrimitives(content);
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
