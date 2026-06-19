import { Ollama } from "ollama";
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
  config: { baseUrl?: string; model: string },
  input: InterviewQuestionAIInput,
): Promise<string> {
  const ollama = new Ollama({ host: config.baseUrl || "http://localhost:11434" });
  const response = await ollama.generate({
    stream: false,
    model: config.model,
    prompt: buildInterviewQuestionPrompt(input),
    system: INTERVIEW_QUESTION_SYSTEM_PROMPT,
    format: "json",
  });

  return parseInterviewQuestionAIResponse(response.response || "{}");
}

export class OllamaInterviewQuestionAIService
  implements InterviewQuestionAIService
{
  constructor(private readonly config: { baseUrl?: string; model: string }) {}

  async generateAnswer(input: InterviewQuestionAIInput): Promise<string> {
    return runInterviewQuestionModel(this.config, input);
  }

  async editAnswer(input: InterviewQuestionAIInput): Promise<string> {
    return runInterviewQuestionModel(this.config, input);
  }
}

export class OllamaInterviewQuestionAIServiceFactory {
  create(config: { baseUrl?: string; model: string }): InterviewQuestionAIService {
    return new OllamaInterviewQuestionAIService(config);
  }
}
