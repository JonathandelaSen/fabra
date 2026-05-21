import { createRequestId } from "@/lib/observability";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import { UserId, type EventTracker } from "@/modules/shared";
import type { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import {
  CV_EDITOR_COPY_PASTE_MODEL,
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-editor-copy-paste-workflow";
import { validateCVProfileCopyPasteResult } from "../services/cv-profile-copy-paste-result.validator";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { UpdateTemplateCVDocumentProfileUseCase } from "./update-template-cv-document-profile.use-case";

export interface ApplyCVEditorCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  parsedResult: unknown;
}

export class ApplyCVEditorCopyPasteUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      updateProfile: UpdateTemplateCVDocumentProfileUseCase;
      tracker: EventTracker;
    },
  ) {}

  async execute(
    input: ApplyCVEditorCopyPasteInput,
  ): Promise<CVDocument | null> {
    const document = await this.deps.documentRepo.findById(
      CVDocumentId.fromPrimitives(input.cvDocumentId),
      UserId.fromPrimitives(input.userId),
    );
    if (!document) return null;

    const structured = validateCVProfileCopyPasteResult(input.parsedResult);

    const updated = await this.deps.updateProfile.execute({
      id: input.cvDocumentId,
      userId: input.userId,
      aiModel: CV_EDITOR_COPY_PASTE_MODEL,
      profile: structured.profile,
    });

    await this.deps.tracker.record({
      userId: input.userId,
      cvId: input.cvDocumentId,
      requestId: createRequestId("cv_editor_copy_paste_apply"),
      stage: "cv_editor_copy_paste_result_applied",
      status: "success",
      source: "cv_library",
      metadata: {
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        workflowId: CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
        schemaVersion: CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
        model: CV_EDITOR_COPY_PASTE_MODEL,
      },
    });

    return updated;
  }
}
