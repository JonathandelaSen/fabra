import { GoogleGenAI } from "@google/genai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  InterviewQuestionAIInput,
  InterviewQuestionAIService,
} from "../../domain/repositories/interview-question-ai.service";
import { InterviewAnswer } from "../../domain/value-objects/interview-answer.value-object";
import { InterviewQuestionPromptService } from "../../domain/services/interview-question-prompt.service";

const promptService = new InterviewQuestionPromptService();

function parseInterviewQuestionAIResponse(rawText: string): string {
  const parsed = JSON.parse(rawText || "{}") as Record<string, unknown>;
  const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";

  if (!answer) {
    throw new Error(
      "The AI could not generate a confident answer. Add more personal context.",
    );
  }

  return answer;
}

async function runInterviewQuestionModel(
  config: { apiKey: string; model: string },
  input: InterviewQuestionAIInput,
): Promise<string> {
  const googleAI = new GoogleGenAI({ apiKey: config.apiKey });
  const response = await googleAI.models.generateContent({
    model: config.model,
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

  return parseInterviewQuestionAIResponse(response.text || "{}");
}

export class GeminiInterviewQuestionAIService
  implements InterviewQuestionAIService
{
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generate(input: InterviewQuestionAIInput): Promise<InterviewAnswer> {
    return InterviewAnswer.fromPrimitives(
      await runInterviewQuestionModel(this.config, input),
    );
  }
}

export class GeminiInterviewQuestionAIServiceFactory {
  create(config: {
    apiKey?: string;
    model: string;
  }): InterviewQuestionAIService {
    if (!config.apiKey) throw badRequest("API key is required for Gemini.", ErrorCode.AI_API_KEY_REQUIRED);
    return new GeminiInterviewQuestionAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
