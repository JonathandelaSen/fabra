export {
  CV_PROFILE_SCHEMA_VERSION,
  normalizeContactEmail,
  buildExternalLinkHref,
  getBestCVText,
  profileToPlainText,
  getCVSourceTextHash,
} from "@/backend/modules/cv-library/domain/cv-profile";
export {
  CVProfile,
  type CVProfilePrimitives,
} from "@/backend/modules/cv-library/domain/value-objects/cv-profile.value-object";
export type { CVLinkPrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-link.value-object";
export type { CVBasicsPrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-basics.value-object";
export type { CVDateRangePrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-date-range.value-object";
export type { CVExperiencePrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-experience.value-object";
export type { CVEducationPrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-education.value-object";
export type { CVSkillGroupPrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-skill-group.value-object";
export type { CVLanguagePrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-language.value-object";
export type { CVNamedItemPrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-named-item.value-object";
export type { CVPresentationPrimitives } from "@/backend/modules/cv-library/domain/value-objects/cv-presentation.value-object";
