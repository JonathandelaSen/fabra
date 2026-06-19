import type { CVStructuredProfileResponse } from "@/backend/modules/cv-library";
import type { GetCVDocumentResponse } from "../../responses";

export interface TemplateCVResponse {
  version: GetCVDocumentResponse;
  profile: CVStructuredProfileResponse | null;
}
