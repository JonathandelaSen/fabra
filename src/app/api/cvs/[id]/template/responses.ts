import type { CVStructuredProfileResponse } from "@/modules/cv-library";
import type { GetCVDocumentResponse } from "../../responses";

export interface TemplateCVResponse {
  version: GetCVDocumentResponse;
  profile: CVStructuredProfileResponse | null;
}
