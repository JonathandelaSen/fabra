import {
  FeedbackNotesFinalPrompt,
  type FeedbackNotesFinalPromptEntry,
  type FeedbackNotesFinalPromptInput,
} from "./feedback-notes-final.prompt";

export type {
  FeedbackNotesFinalPromptEntry,
  FeedbackNotesFinalPromptInput,
};

export class FeedbackNotesFinalPromptService {
  private readonly prompt = new FeedbackNotesFinalPrompt();

  systemInstruction(): string {
    return this.prompt.systemInstruction();
  }

  build(input: FeedbackNotesFinalPromptInput): string {
    return this.prompt.build(input);
  }

  buildForClipboard(input: FeedbackNotesFinalPromptInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
