import OpenAI from "openai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  ReviewSelfAssessmentAIInput,
  ReviewSelfAssessmentAIService,
} from "../../domain/repositories/review-self-assessment-ai.service";
import { SelfAssessmentContent } from "../../domain/value-objects/self-assessment-content.value-object";
import { ReviewSelfAssessmentPromptService } from "../../domain/services/review-self-assessment-prompt.service";

const promptService = new ReviewSelfAssessmentPromptService();

export class OpenAIReviewSelfAssessmentAIService
  implements ReviewSelfAssessmentAIService
{
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generate(input: ReviewSelfAssessmentAIInput): Promise<SelfAssessmentContent> {
    const openai = new OpenAI({ apiKey: this.config.apiKey });
    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: promptService.systemInstruction() },
        { role: "user", content: promptService.build(input) },
      ],
    });

    const content = (response.choices[0]?.message.content || "").trim();
    if (!content) {
      throw new Error("The AI could not generate the self-assessment.");
    }
    return SelfAssessmentContent.fromPrimitives(content);
  }
}

export class OpenAIReviewSelfAssessmentAIServiceFactory {
  create(config: {
    apiKey?: string;
    model: string;
  }): ReviewSelfAssessmentAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAIReviewSelfAssessmentAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
