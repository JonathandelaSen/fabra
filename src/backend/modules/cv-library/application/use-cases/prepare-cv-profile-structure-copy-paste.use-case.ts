import { createRequestId } from "@/lib/observability";
import { badRequest, CopyPastePreparation } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import {
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-profile-copy-paste-workflow";
import { PrepareCVAnalysisInputUseCase } from "./prepare-cv-analysis-input.use-case";

export interface PrepareCVProfileStructureCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  templateId?: string | null;
  locale?: string | null;
}

export class PrepareCVProfileStructureCopyPasteUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      prepareAnalysisInput: PrepareCVAnalysisInputUseCase;
      buildPrompt: (input: {
        text: string;
        templateId?: string | null;
        locale?: string | null;
      }) => string;
    },
  ) {}

  async execute(
    input: PrepareCVProfileStructureCopyPasteInput,
  ): Promise<CopyPastePreparation | null> {
    const requestId = createRequestId("cv_profile_copy_paste_prepare");
    const prepared = await this.deps.prepareAnalysisInput.execute({
      cvId: input.cvDocumentId,
      userId: input.userId,
      requestId,
      source: "cv_profile_copy_paste",
    });
    if (!prepared) return null;

    const text = prepared.analysisText;
    if (!text) {
      throw badRequest(
        "No extracted text available for this CV",
        ErrorCode.CV_NO_EXTRACTED_TEXT,
      );
    }

    const prompt = this.deps.buildPrompt({
      text,
      templateId: input.templateId,
      locale: input.locale,
    });

    return CopyPastePreparation.fromPrimitives({
      workflowId: CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
      prompt,
      expectedResponse: { kind: "json", envelope: true },
      privacyNotice:
        "This prompt includes extracted CV data. Paste it only into external tools you trust.",
      interactionId: null,
      attemptId: null,
    });
  }
}
