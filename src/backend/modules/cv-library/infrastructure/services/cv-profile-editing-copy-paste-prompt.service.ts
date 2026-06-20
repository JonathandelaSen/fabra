import {
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-editor-copy-paste-workflow";
import { CVProfileEditingPromptService } from "../../domain/services/cv-profile-editing-prompt.service";
import { CopyPastePreparation } from "@/backend/modules/shared/domain/value-objects/copy-paste-preparation.value-object";
import type {
  BuildCVProfileEditingCopyPastePromptInput,
  CVProfileEditingCopyPastePromptServicePort,
} from "../../domain/services/cv-profile-editing-copy-paste-prompt-service";

export class CVProfileEditingCopyPastePromptService
  implements CVProfileEditingCopyPastePromptServicePort
{
  constructor(
    private readonly promptService: CVProfileEditingPromptService,
  ) {}

  prepare(input: BuildCVProfileEditingCopyPastePromptInput): CopyPastePreparation {
    return CopyPastePreparation.fromPrimitives({
      workflowId: CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
      prompt: this.promptService.buildForClipboard(input),
      expectedResponse: { kind: "json", envelope: true },
      privacyNotice:
        "This prompt includes your full CV profile data. Paste it only into external tools you trust.",
      interactionId: null,
      attemptId: null,
    });
  }
}
