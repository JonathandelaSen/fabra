import type { CVProfilePrimitives } from "@/backend/modules/cv-library";

export interface PreviewCVEditorCopyPasteResponse {
  parsedResult: CVProfilePrimitives;
  preview: {
    basicsName: string | null;
    sectionsCount: number;
    changedSections: string[];
    originLabel: "external_chat";
  };
  warnings: string[];
}
