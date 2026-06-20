import {
  CVProfileStructuringPrompt,
  type CVProfileStructuringCopyPastePromptInput,
} from "./cv-profile-structuring.prompt";

export type { CVProfileStructuringCopyPastePromptInput };

export class CVProfileStructuringPromptService {
  private readonly prompt = new CVProfileStructuringPrompt();

  build(): string {
    return this.prompt.build();
  }

  buildForClipboard(input: CVProfileStructuringCopyPastePromptInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
