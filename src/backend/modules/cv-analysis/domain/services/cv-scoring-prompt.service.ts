import {
  CVScoringPrompt,
  type CVScoringCopyPastePromptInput,
  type CVScoringPromptInput,
} from "./cv-scoring.prompt";

export type { CVScoringCopyPastePromptInput, CVScoringPromptInput };

export class CVScoringPromptService {
  private readonly prompt = new CVScoringPrompt();

  build(input: CVScoringPromptInput): string {
    return this.prompt.build(input);
  }

  buildForClipboard(input: CVScoringCopyPastePromptInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
