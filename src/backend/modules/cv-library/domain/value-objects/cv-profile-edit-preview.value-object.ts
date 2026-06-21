import { ValueObject, StringList } from "@/backend/modules/shared";
import { CVProfile, type CVProfilePrimitives } from "./cv-profile.value-object";
import type { CVEditorCopyPastePreviewPrimitives } from "./cv-editor-copy-paste-preview.value-object";
import { CVEditorCopyPastePreview } from "./cv-editor-copy-paste-preview.value-object";

export interface CVProfileEditPreviewPrimitives {
  parsedResult: CVProfilePrimitives;
  preview: CVEditorCopyPastePreviewPrimitives;
  warnings: string[];
}

export class CVProfileEditPreview extends ValueObject<CVProfileEditPreviewPrimitives> {
  private constructor(
    private readonly parsedProfile: CVProfile,
    private readonly previewVo: CVEditorCopyPastePreview,
    private readonly warningsVo: StringList,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVProfileEditPreviewPrimitives,
  ): CVProfileEditPreview {
    return new CVProfileEditPreview(
      CVProfile.fromPrimitives(primitives.parsedResult),
      CVEditorCopyPastePreview.fromPrimitives(primitives.preview),
      StringList.fromPrimitives(primitives.warnings),
    );
  }

  toPrimitives(): CVProfileEditPreviewPrimitives {
    return {
      parsedResult: this.parsedProfile.toPrimitives(),
      preview: this.previewVo.toPrimitives(),
      warnings: this.warningsVo.toPrimitives(),
    };
  }

  get parsedResult(): CVProfilePrimitives {
    return this.parsedProfile.toPrimitives();
  }

  get preview(): CVEditorCopyPastePreviewPrimitives {
    return this.previewVo.toPrimitives();
  }

  get warnings(): string[] {
    return this.warningsVo.toPrimitives();
  }
}
