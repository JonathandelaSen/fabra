import { createRequestId } from "@/lib/observability";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import { ErrorCode } from "@/shared/error-codes";
import { badRequest, UserId } from "@/modules/shared";
import {
  getCVSourceTextHash,
  type StandardCVProfile,
} from "../../domain/cv-profile";
import { getCVTemplate, type CVTemplateLocale } from "../../domain/cv-templates";
import type { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVStructuredProfile } from "../../domain/entities/cv-structured-profile.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import {
  CV_PROFILE_COPY_PASTE_MODEL,
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
  validateCVProfileCopyPasteResult,
} from "../services/cv-profile-copy-paste-result.validator";
import { CreateTemplateCVDocumentUseCase } from "./create-template-cv-document.use-case";
import { PrepareCVAnalysisInputUseCase } from "./prepare-cv-analysis-input.use-case";
import { UpsertCVStructuredProfileUseCase } from "./upsert-cv-structured-profile.use-case";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { StructuredCVProfileAndVersion } from "../../domain/value-objects/structured-cv-profile-and-version.value-object";

export interface ApplyCVProfileStructureCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  parsedResult: unknown;
  templateId?: string | null;
  locale?: string | null;
  createTemplateVersion?: boolean;
}

export class ApplyCVProfileStructureCopyPasteUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      prepareAnalysisInput: PrepareCVAnalysisInputUseCase;
      upsertProfile: UpsertCVStructuredProfileUseCase;
      createTemplateDocument: CreateTemplateCVDocumentUseCase;
    },
  ) {}

  async execute(
    input: ApplyCVProfileStructureCopyPasteInput,
  ): Promise<StructuredCVProfileAndVersion | null> {
    const document = await this.deps.documentRepo.findById(
      CVDocumentId.fromPrimitives(input.cvDocumentId),
      UserId.fromPrimitives(input.userId),
    );
    if (!document) return null;

    const primitives = document.toPrimitives();
    const requestId = createRequestId("cv_profile_copy_paste_apply");
    const prepared = await this.deps.prepareAnalysisInput.execute({
      cvId: input.cvDocumentId,
      userId: input.userId,
      requestId,
      source: "cv_profile_copy_paste",
    });
    const text = prepared?.analysisText ?? null;
    if (!text) {
      throw badRequest("No extracted text available for this CV", ErrorCode.CV_NO_EXTRACTED_TEXT);
    }

    const structured = validateCVProfileCopyPasteResult(input.parsedResult);
    const sourceTextHash = getCVSourceTextHash(text);
    const profile = await this.deps.upsertProfile.execute({
      userId: input.userId,
      cvDocumentId: input.cvDocumentId,
      schemaVersion: structured.schemaVersion,
      sourceTextHash,
      aiModel: CV_PROFILE_COPY_PASTE_MODEL,
      profile: structured.profile,
    });

    const version = input.createTemplateVersion
      ? await this.createTemplateVersion({
          input,
          sourceName: primitives.name,
          profile: structured.profile,
          schemaVersion: structured.schemaVersion,
          sourceTextHash,
        })
      : null;

    return StructuredCVProfileAndVersion.create(profile, version);
  }

  private async createTemplateVersion(input: {
    input: ApplyCVProfileStructureCopyPasteInput;
    sourceName: string;
    profile: StandardCVProfile;
    schemaVersion: string;
    sourceTextHash: string;
  }): Promise<CVDocument> {
    const template = input.input.templateId
      ? getCVTemplate(input.input.templateId)
      : null;
    if (!template) {
      throw badRequest("Template not found", ErrorCode.TEMPLATE_NOT_FOUND);
    }

    const requestedLocale = (input.input.locale ?? "es") as CVTemplateLocale;
    const selectedLocale = template.locales.includes(requestedLocale)
      ? requestedLocale
      : "es";

    return this.deps.createTemplateDocument.execute({
      userId: input.input.userId,
      sourceCvId: input.input.cvDocumentId,
      name: `${input.sourceName} · ${template.name}`,
      templateId: template.templateId,
      templateLocale: selectedLocale,
      schemaVersion: input.schemaVersion,
      sourceTextHash: input.sourceTextHash,
      aiModel: CV_PROFILE_COPY_PASTE_MODEL,
      profile: input.profile,
    });
  }
}
