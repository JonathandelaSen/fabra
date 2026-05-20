import { createRequestId } from "@/lib/observability";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import { extractCopyPasteJson } from "@/modules/shared/application/assisted-workflows/copy-paste-json-parser";
import { validateCopyPasteEnvelope } from "@/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import { UserId, type EventTracker } from "@/modules/shared";
import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import {
  CV_PROFILE_COPY_PASTE_MODEL,
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
  validateCVProfileCopyPasteResult,
} from "../services/cv-profile-copy-paste-result.validator";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";

export interface PreviewCVProfileStructureCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  rawResponse: string;
}

export interface PreviewCVProfileStructureCopyPasteResult {
  parsedResult: StandardCVProfile;
  preview: {
    basicsName: string | null;
    sectionsCount: number;
    missingImportantFields: string[];
    templateLocale: string | null;
    completeness: number;
    originLabel: "external_chat";
  };
  warnings: string[];
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
      tracker: EventTracker;
    },
  ) {}

  async execute(
    input: PreviewCVProfileStructureCopyPasteInput,
  ): Promise<PreviewCVProfileStructureCopyPasteResult | null> {
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

    await this.deps.tracker.record({
      userId: input.userId,
      cvId: input.cvDocumentId,
      requestId: createRequestId("cv_profile_copy_paste_preview"),
      stage: "cv_profile_copy_paste_response_previewed",
      status: "success",
      source: "cv_library",
      metadata: {
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        workflowId: CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
        schemaVersion: CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
        model: CV_PROFILE_COPY_PASTE_MODEL,
      },
    });

    return {
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
    };
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
