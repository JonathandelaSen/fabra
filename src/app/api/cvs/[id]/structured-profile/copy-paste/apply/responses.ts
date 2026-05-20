import type {
  CVDocumentResponse,
  CVStructuredProfileResponse,
} from "@/modules/cv-library";

export interface ApplyCVProfileCopyPasteResponse {
  profile: CVStructuredProfileResponse;
  version: CVDocumentResponse | null;
}
