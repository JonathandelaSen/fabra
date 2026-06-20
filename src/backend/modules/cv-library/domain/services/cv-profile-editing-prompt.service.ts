import { CVProfileEditingPrompt } from "./cv-profile-editing.prompt";
import type { BuildCVProfileEditingCopyPastePromptInput } from "./cv-profile-editing-copy-paste-prompt-service";

export class CVProfileEditingPromptService {
  private readonly prompt = new CVProfileEditingPrompt();

  build(): string {
    return this.prompt.build();
  }

  buildForClipboard(input: BuildCVProfileEditingCopyPastePromptInput): string {
    return this.prompt.buildForClipboard(input);
  }
}
