import type { CVDocumentResponse } from "@/backend/modules/cv-library";

export interface EditCVProfileResponse {
  version: CVDocumentResponse | null;
}
