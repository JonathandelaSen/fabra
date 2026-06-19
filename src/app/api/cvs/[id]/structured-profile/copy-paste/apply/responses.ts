import type {
  CVDocumentResponse,
  CVStructuredProfileResponse,
} from "@/backend/modules/cv-library";

export interface ApplyCVProfileCopyPasteResponse {
  profile: CVStructuredProfileResponse;
  version: CVDocumentResponse | null;
}
