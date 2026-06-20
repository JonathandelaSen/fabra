import type { CopyPastePreparation } from "@/backend/modules/shared";
import type { StandardCVProfile } from "../cv-profile";

export interface BuildCVProfileEditingCopyPastePromptInput {
  profile: StandardCVProfile;
  instruction: string;
  templateId?: string | null;
  locale?: string | null;
  recommendations?: string[];
}

export interface CVProfileEditingCopyPastePromptServicePort {
  prepare(input: BuildCVProfileEditingCopyPastePromptInput): CopyPastePreparation;
}
