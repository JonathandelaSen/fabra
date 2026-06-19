import { badRequest } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import {
  CV_PROFILE_SCHEMA_VERSION,
  normalizeStandardCVProfile,
  type StandardCVProfile,
} from "../../domain/cv-profile";
export {
  CV_PROFILE_COPY_PASTE_MODEL,
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-profile-copy-paste-workflow";

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function hasMeaningfulProfileData(profile: StandardCVProfile): boolean {
  const basics = profile.basics ?? {};
  return Boolean(
    basics.name ||
      basics.email ||
      profile.summary ||
      hasItems(profile.experience) ||
      hasItems(profile.education) ||
      hasItems(profile.skills) ||
      hasItems(profile.technicalSkills),
  );
}

export function validateCVProfileCopyPasteResult(
  result: unknown,
): {
  schemaVersion: typeof CV_PROFILE_SCHEMA_VERSION;
  profile: StandardCVProfile;
} {
  const profile = normalizeStandardCVProfile(result);
  if (!hasMeaningfulProfileData(profile)) {
    throw badRequest("The pasted response does not include a usable CV profile.", ErrorCode.COPY_PASTE_INVALID_RESULT);
  }

  return {
    schemaVersion: CV_PROFILE_SCHEMA_VERSION,
    profile,
  };
}
