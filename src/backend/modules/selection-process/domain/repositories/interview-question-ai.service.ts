import type { Analysis, CVRecord } from "@/lib/analysis-types";
import type { AIProvider } from "@/backend/modules/shared";
import type { InterviewAnswer } from "../value-objects/interview-answer.value-object";

export interface InterviewQuestionAIInput {
  question: string;
  context: string;
  currentAnswer?: string | null;
  instruction?: string | null;
  cv?: CVRecord | null;
  cvText?: string | null;
  analysis?: Analysis | null;
}

export interface InterviewQuestionAIService {
  generate(input: InterviewQuestionAIInput): Promise<InterviewAnswer>;
}

export interface InterviewQuestionAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): InterviewQuestionAIService;
}
