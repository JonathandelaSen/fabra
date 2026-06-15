export {
  createCVLibraryModule,
  type CVLibraryModule,
} from "./cv-library.module";
export {
  CV_PROFILE_SCHEMA_VERSION,
  type StandardCVLink,
  type StandardCVBasics,
  type StandardCVDateRange,
  type StandardCVExperience,
  type StandardCVEducation,
  type StandardCVSkillGroup,
  type StandardCVLanguage,
  type StandardCVNamedItem,
  type StandardCVPresentation,
  type StandardCVProfile,
  normalizeStandardCVProfile,
  getBestCVText,
  getBestCVPrimitiveText,
  profileToPlainText,
  getCVSourceTextHash,
} from "./domain/cv-profile";
export type { CVPublicNotePrimitives, CVPublicNoteAnchorType } from "./domain/entities/cv-public-note.entity";
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
export type {
  CreateJsonResumeCVDocumentInput,
  CreateJsonResumeCVDocumentResult,
} from "./application/use-cases/create-json-resume-cv-document.use-case";
export type {
  PrepareCVAnalysisInputInput,
  PrepareCVAnalysisInputResult,
} from "./application/use-cases/prepare-cv-analysis-input.use-case";
export type { DeleteCVDocumentResult } from "./application/use-cases/delete-cv-document.use-case";
export {
  PUBLIC_CV_SLUG_MAX_LENGTH,
  PUBLIC_CV_ID_LENGTH,
  type PublicCVSettingsRequest,
  normalizePublicCVSlug,
  buildPublicCVPath,
  generatePublicCVId,
} from "./domain/services/public-cv";
