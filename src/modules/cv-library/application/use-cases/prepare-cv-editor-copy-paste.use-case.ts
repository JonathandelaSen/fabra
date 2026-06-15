import { badRequest, UserId } from "@/modules/shared";
import type { StandardCVProfile } from "../../domain/cv-profile";
import { ErrorCode } from "@/shared/error-codes";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import {
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-editor-copy-paste-workflow";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";

export interface PrepareCVEditorCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  instruction: string;
  templateId?: string | null;
  locale?: string | null;
  recommendations?: string[];
}

export interface PrepareCVEditorCopyPasteResult {
  workflowId: typeof CV_EDITOR_COPY_PASTE_WORKFLOW_ID;
  schemaVersion: typeof CV_EDITOR_COPY_PASTE_SCHEMA_VERSION;
  prompt: string;
  expectedResponse: { kind: "json"; envelope: true };
  privacyNotice: string;
}

export class PrepareCVEditorCopyPasteUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      buildPrompt: (input: {
        profile: StandardCVProfile;
        instruction: string;
        templateId?: string | null;
        locale?: string | null;
        recommendations?: string[];
      }) => string;
    },
  ) {}

  async execute(
    input: PrepareCVEditorCopyPasteInput,
  ): Promise<PrepareCVEditorCopyPasteResult | null> {
    const document = await this.deps.documentRepo.findById(
      CVDocumentId.fromPrimitives(input.cvDocumentId),
      UserId.fromPrimitives(input.userId),
    );
    if (!document) return null;

    const primitives = document.toPrimitives();
    if (primitives.type !== "template") {
      throw badRequest("Only template CVs support editing", ErrorCode.ONLY_TEMPLATE_CVS_EDITABLE);
    }
    if (!primitives.profile) {
      throw badRequest("CV has no profile to edit", ErrorCode.CV_NO_PROFILE);
    }

    const prompt = this.deps.buildPrompt({
      profile: primitives.profile as StandardCVProfile,
      instruction: input.instruction,
      templateId: input.templateId ?? primitives.templateId,
      locale: input.locale ?? primitives.templateLocale,
      recommendations: input.recommendations,
    });

    return {
      workflowId: CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
      prompt,
      expectedResponse: { kind: "json", envelope: true },
      privacyNotice:
        "This prompt includes your full CV profile data. Paste it only into external tools you trust.",
    };
  }
}
