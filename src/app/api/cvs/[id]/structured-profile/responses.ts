import type { CVStructuredProfileResponse } from "@/backend/modules/cv-library";

export interface GetCVStructuredProfileResponse {
  profile: CVStructuredProfileResponse | null;
}

export interface StructureCVProfileResponse {
  profile: CVStructuredProfileResponse;
  cached: boolean;
}
