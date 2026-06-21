export {
  CVProfile,
  type CVProfilePrimitives,
} from "./domain/value-objects/cv-profile.value-object";
export type { CVLinkPrimitives } from "./domain/value-objects/cv-link.value-object";
export type { CVBasicsPrimitives } from "./domain/value-objects/cv-basics.value-object";
export type { CVDateRangePrimitives } from "./domain/value-objects/cv-date-range.value-object";
export type { CVExperiencePrimitives } from "./domain/value-objects/cv-experience.value-object";
export type { CVEducationPrimitives } from "./domain/value-objects/cv-education.value-object";
export type { CVSkillGroupPrimitives } from "./domain/value-objects/cv-skill-group.value-object";
export type { CVLanguagePrimitives } from "./domain/value-objects/cv-language.value-object";
export type { CVNamedItemPrimitives } from "./domain/value-objects/cv-named-item.value-object";
export type { CVPresentationPrimitives } from "./domain/value-objects/cv-presentation.value-object";
export {
  createCVLibraryModule,
  type CVLibraryModule,
} from "./cv-library.module";
export {
  CV_PROFILE_SCHEMA_VERSION,
  getBestCVText,
  getBestCVPrimitiveText,
  profileToPlainText,
  getCVSourceTextHash,
} from "./domain/cv-profile";
export type {
  CVPublicNotePrimitives,
  CVPublicNoteAnchorType,
} from "./domain/entities/cv-public-note.entity";
export type { CVDocumentTypePrimitives } from "./domain/value-objects/cv-document-type.value-object";
export {
  type CVTemplateId,
  type CVTemplateLocale,
  type CVRenderableSectionId,
  type CVPresentationInput,
  type CVTemplateDefinition,
  CV_RENDERABLE_SECTIONS,
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  isRenderableSectionId,
  normalizeSectionOrder,
  normalizeSectionTitles,
  normalizeAccentColor,
  getTemplateAccentColor,
  getResolvedAccentColor,
  getOrderedRenderableSections,
  getSectionTitle,
  CV_TEMPLATES,
  getCVTemplate,
  getSectionLabels,
} from "./domain/cv-templates";
export { CV_PDFS_BUCKET } from "./domain/services/cv-storage";
export {
  CV_PROFILE_COPY_PASTE_MODEL,
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "./domain/services/cv-profile-copy-paste-workflow";
export {
  CV_EDITOR_COPY_PASTE_MODEL,
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "./domain/services/cv-editor-copy-paste-workflow";
export {
  presentCVDocument,
  presentCVDocumentSummary,
  presentCVDocuments,
  presentCVStructuredProfile,
  type CVDocumentResponse,
  type CVDocumentSummaryResponse,
  type CVStructuredProfileResponse,
} from "./application/presenters/cv-library-presenters";
export type { CreateJsonResumeCVDocumentInput } from "./application/use-cases/create-json-resume-cv-document.use-case";
export {
  ImportedCVDocument,
  type ImportedCVDocumentPrimitives,
} from "./domain/value-objects/imported-cv-document.value-object";
export type { PrepareCVAnalysisInputInput } from "./application/use-cases/prepare-cv-analysis-input.use-case";
export {
  CVAnalysisInput,
  type CVAnalysisInputPrimitives,
} from "./domain/value-objects/cv-analysis-input.value-object";
export {
  CVDeletionOutcome,
  type CVDeletionOutcomePrimitives,
} from "./domain/value-objects/cv-deletion-outcome.value-object";
export {
  StructuredCVProfileData,
  type StructuredCVProfileDataPrimitives,
} from "./domain/value-objects/structured-cv-profile-data.value-object";
export {
  CVDeletionStatus,
  cvDeletionStatuses,
  type CVDeletionStatusPrimitives,
} from "./domain/value-objects/cv-deletion-status.value-object";
export {
  PUBLIC_CV_SLUG_MAX_LENGTH,
  PUBLIC_CV_ID_LENGTH,
  type PublicCVSettingsRequest,
  normalizePublicCVSlug,
  buildPublicCVPath,
  generatePublicCVId,
} from "./domain/services/public-cv";
