import { UserId } from "@/backend/modules/shared";
import { extractCopyPasteJson } from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-parser";
import { validateCopyPasteEnvelope } from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import {
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
  validateCVProfileCopyPasteResult,
} from "../services/cv-profile-copy-paste-result.validator";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVProfileStructurePreview } from "../../domain/value-objects/cv-profile-structure-preview.value-object";

export interface PreviewCVProfileStructureCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  rawResponse: string;
}

const IMPORTANT_FIELDS = [
  "basics.name",
  "basics.email",
  "summary",
  "experience",
  "skills",
] as const;

export class PreviewCVProfileStructureCopyPasteUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
    },
  ) {}

  async execute(
    input: PreviewCVProfileStructureCopyPasteInput,
  ): Promise<CVProfileStructurePreview | null> {
    const document = await this.deps.documentRepo.findById(
      CVDocumentId.fromPrimitives(input.cvDocumentId),
      UserId.fromPrimitives(input.userId),
    );
    if (!document) return null;

    const envelope = extractCopyPasteJson(input.rawResponse);
    const result = validateCopyPasteEnvelope(envelope, {
      workflowId: CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
    });
    const parsed = validateCVProfileCopyPasteResult(result);
    const profile = parsed.profile;
    const primitives = document.toPrimitives();
    const missingImportantFields = getMissingImportantFields(profile);
    const sectionsCount = countDetectedSections(profile);

    return CVProfileStructurePreview.fromPrimitives({
      parsedResult: profile,
      preview: {
        basicsName: profile.basics?.name ?? null,
        sectionsCount,
        missingImportantFields,
        templateLocale: primitives.templateLocale,
        completeness: Math.round(
          ((IMPORTANT_FIELDS.length - missingImportantFields.length) /
            IMPORTANT_FIELDS.length) *
            100,
        ),
        originLabel: "external_chat",
      },
      warnings:
        missingImportantFields.length > 0
          ? ["Some important profile fields are missing."]
          : [],
    });
  }
}

function getMissingImportantFields(profile: StandardCVProfile): string[] {
  return IMPORTANT_FIELDS.filter((field) => {
    if (field === "basics.name") return !profile.basics?.name;
    if (field === "basics.email") return !profile.basics?.email;
    if (field === "summary") return !profile.summary;
    if (field === "experience") return !profile.experience?.length;
    return !profile.skills?.length && !profile.technicalSkills?.length;
  });
}

function countDetectedSections(profile: StandardCVProfile): number {
  return [
    profile.basics && Object.keys(profile.basics).length > 0,
    profile.summary,
    profile.experience?.length,
    profile.education?.length,
    profile.skills?.length,
    profile.technicalSkills?.length,
    profile.languages?.length,
    profile.certifications?.length,
    profile.projects?.length,
    profile.awards?.length,
    profile.publications?.length,
    profile.volunteering?.length,
  ].filter(Boolean).length;
}
