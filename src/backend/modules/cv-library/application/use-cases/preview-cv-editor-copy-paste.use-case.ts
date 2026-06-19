import { UserId } from "@/backend/modules/shared";
import { extractCopyPasteJson } from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-parser";
import { validateCopyPasteEnvelope } from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import {
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-editor-copy-paste-workflow";
import { validateCVProfileCopyPasteResult } from "../services/cv-profile-copy-paste-result.validator";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVProfileEditPreview } from "../../domain/value-objects/cv-profile-edit-preview.value-object";

export interface PreviewCVEditorCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  rawResponse: string;
}

export class PreviewCVEditorCopyPasteUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
    },
  ) {}

  async execute(
    input: PreviewCVEditorCopyPasteInput,
  ): Promise<CVProfileEditPreview | null> {
    const document = await this.deps.documentRepo.findById(
      CVDocumentId.fromPrimitives(input.cvDocumentId),
      UserId.fromPrimitives(input.userId),
    );
    if (!document) return null;

    const envelope = extractCopyPasteJson(input.rawResponse);
    const result = validateCopyPasteEnvelope(envelope, {
      workflowId: CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
    });
    const parsed = validateCVProfileCopyPasteResult(result);
    const editedProfile = parsed.profile;

    const primitives = document.toPrimitives();
    const currentProfile = (primitives.profile ?? {}) as StandardCVProfile;
    const changedSections = detectChangedSections(currentProfile, editedProfile);
    const warnings: string[] = [];
    if (changedSections.length > 5) {
      warnings.push("Large rewrite detected — many sections were changed.");
    }

    return CVProfileEditPreview.fromPrimitives({
      parsedResult: editedProfile,
      preview: {
        basicsName: editedProfile.basics?.name ?? null,
        sectionsCount: countDetectedSections(editedProfile),
        changedSections,
        originLabel: "external_chat",
      },
      warnings,
    });
  }
}

const SECTION_KEYS = [
  "basics",
  "summary",
  "experience",
  "education",
  "skills",
  "technicalSkills",
  "languages",
  "certifications",
  "projects",
  "awards",
  "publications",
  "volunteering",
] as const;

function detectChangedSections(
  current: StandardCVProfile,
  edited: StandardCVProfile,
): string[] {
  return SECTION_KEYS.filter((key) => {
    const a = JSON.stringify(current[key] ?? null);
    const b = JSON.stringify(edited[key] ?? null);
    return a !== b;
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
