import type { CVDocumentResponse } from "@/modules/cv-library";

export interface CreateJsonResumeCVDocumentResponse {
  document: CVDocumentResponse;
  warnings: string[];
}
