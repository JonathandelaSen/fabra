import { badRequest, CopyPastePreparation, UserId } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import type { CVProfileEditingCopyPastePromptServicePort } from "../../domain/services/cv-profile-editing-copy-paste-prompt-service";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";

export interface PrepareCVEditorCopyPasteInput {
  cvDocumentId: string;
  userId: string;
  instruction: string;
  templateId?: string | null;
  locale?: string | null;
  recommendations?: string[];
}

export class PrepareCVEditorCopyPasteUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      promptService: CVProfileEditingCopyPastePromptServicePort;
    },
  ) {}

  async execute(
    input: PrepareCVEditorCopyPasteInput,
  ): Promise<CopyPastePreparation | null> {
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

    return this.deps.promptService.prepare({
      profile: primitives.profile as StandardCVProfile,
      instruction: input.instruction,
      templateId: input.templateId ?? primitives.templateId,
      locale: input.locale ?? primitives.templateLocale,
      recommendations: input.recommendations,
    });
  }
}
