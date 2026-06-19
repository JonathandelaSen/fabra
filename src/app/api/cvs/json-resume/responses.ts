import type { CVDocumentResponse } from "@/backend/modules/cv-library";

export interface CreateJsonResumeCVDocumentResponse {
  document: CVDocumentResponse;
  warnings: string[];
}
