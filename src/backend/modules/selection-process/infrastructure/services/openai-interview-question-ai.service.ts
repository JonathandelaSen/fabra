import OpenAI from "openai";
import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type {
  InterviewQuestionAIInput,
  InterviewQuestionAIService,
} from "../../domain/repositories/interview-question-ai.service";
import {
  INTERVIEW_QUESTION_SYSTEM_PROMPT,
  buildInterviewQuestionPrompt,
} from "./interview-question-prompts";

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
  const openai = new OpenAI({ apiKey: config.apiKey });
  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: "system", content: INTERVIEW_QUESTION_SYSTEM_PROMPT },
      { role: "user", content: buildInterviewQuestionPrompt(input) },
    ],
    response_format: { type: "json_object" },
  });

  return parseInterviewQuestionAIResponse(response.choices[0]?.message.content || "{}");
}

export class OpenAIInterviewQuestionAIService
  implements InterviewQuestionAIService
{
  constructor(private readonly config: { apiKey: string; model: string }) {}

  async generateAnswer(input: InterviewQuestionAIInput): Promise<string> {
    return runInterviewQuestionModel(this.config, input);
  }

  async editAnswer(input: InterviewQuestionAIInput): Promise<string> {
    return runInterviewQuestionModel(this.config, input);
  }
}

export class OpenAIInterviewQuestionAIServiceFactory {
  create(config: {
    apiKey?: string;
    model: string;
  }): InterviewQuestionAIService {
    if (!config.apiKey) throw badRequest("API key is required for OpenAI.", ErrorCode.AI_API_KEY_REQUIRED);
    return new OpenAIInterviewQuestionAIService({
      apiKey: config.apiKey,
      model: config.model,
    });
  }
}
