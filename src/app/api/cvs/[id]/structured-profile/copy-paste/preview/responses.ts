import type { CVProfilePrimitives } from "@/backend/modules/cv-library";

export interface PreviewCVProfileCopyPasteResponse {
  parsedResult: CVProfilePrimitives;
  preview: {
    basicsName: string | null;
    sectionsCount: number;
    missingImportantFields: string[];
    templateLocale: string | null;
    completeness: number;
    originLabel: "external_chat";
  };
  warnings: string[];
}
