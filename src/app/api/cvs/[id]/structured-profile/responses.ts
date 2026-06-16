import type { CVStructuredProfileResponse } from "@/modules/cv-library";

export interface GetCVStructuredProfileResponse {
  profile: CVStructuredProfileResponse | null;
}

export interface StructureCVProfileResponse {
  profile: CVStructuredProfileResponse;
  cached: boolean;
}
