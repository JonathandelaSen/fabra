import {
  InterviewQuestionPrompt,
  type InterviewQuestionPromptInput,
} from "./interview-question.prompt";

export type { InterviewQuestionPromptInput };

export class InterviewQuestionPromptService {
  private readonly prompt = new InterviewQuestionPrompt();

  systemInstruction(): string {
    return this.prompt.systemInstruction();
  }

  build(input: InterviewQuestionPromptInput): string {
    return this.prompt.build(input);
  }

  buildForClipboard(input: InterviewQuestionPromptInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
