import {
  JobMatchScoringPrompt,
  type JobMatchScoringCopyPastePromptInput,
  type JobMatchScoringPromptInput,
} from "./job-match-scoring.prompt";

export type {
  JobMatchScoringCopyPastePromptInput,
  JobMatchScoringPromptInput,
};

export class JobMatchScoringPromptService {
  private readonly prompt = new JobMatchScoringPrompt();

  build(input: JobMatchScoringPromptInput): string {
    return this.prompt.build(input);
  }

  buildForClipboard(input: JobMatchScoringCopyPastePromptInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
