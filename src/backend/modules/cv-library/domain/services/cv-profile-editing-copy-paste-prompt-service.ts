import type { CopyPastePreparation } from "@/backend/modules/shared";
import type { CVProfilePrimitives } from "../value-objects/cv-profile.value-object";

export interface BuildCVProfileEditingCopyPastePromptInput {
  profile: CVProfilePrimitives;
  instruction: string;
  templateId?: string | null;
  locale?: string | null;
  recommendations?: string[];
}

export interface CVProfileEditingCopyPastePromptServicePort {
  prepare(
    input: BuildCVProfileEditingCopyPastePromptInput,
  ): CopyPastePreparation;
}
