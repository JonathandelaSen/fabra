import type { StandardCVProfile } from "@/backend/modules/cv-library";

export interface PreviewCVEditorCopyPasteResponse {
  parsedResult: StandardCVProfile;
  preview: {
    basicsName: string | null;
    sectionsCount: number;
    changedSections: string[];
    originLabel: "external_chat";
  };
  warnings: string[];
}
