import { ValueObject, StringList } from "@/modules/shared";
import type { StandardCVProfilePrimitives } from "../cv-profile";
import type { CVEditorCopyPastePreviewPrimitives } from "./cv-editor-copy-paste-preview.value-object";
import { CVEditorCopyPastePreview } from "./cv-editor-copy-paste-preview.value-object";

export interface CVProfileEditPreviewPrimitives {
  parsedResult: StandardCVProfilePrimitives;
  preview: CVEditorCopyPastePreviewPrimitives;
  warnings: string[];
}

export class CVProfileEditPreview extends ValueObject<CVProfileEditPreviewPrimitives> {
  private constructor(
    private readonly parsedProfile: StandardCVProfilePrimitives,
    private readonly previewVo: CVEditorCopyPastePreview,
    private readonly warningsVo: StringList
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVProfileEditPreviewPrimitives
  ): CVProfileEditPreview {
    return new CVProfileEditPreview(
      primitives.parsedResult,
      CVEditorCopyPastePreview.fromPrimitives(primitives.preview),
      StringList.fromPrimitives(primitives.warnings)
    );
  }

  toPrimitives(): CVProfileEditPreviewPrimitives {
    return {
      parsedResult: this.parsedProfile,
      preview: this.previewVo.toPrimitives(),
      warnings: this.warningsVo.toPrimitives(),
    };
  }

  get parsedResult(): StandardCVProfilePrimitives {
    return this.parsedProfile;
  }

  get preview(): CVEditorCopyPastePreviewPrimitives {
    return this.previewVo.toPrimitives();
  }

  get warnings(): string[] {
    return this.warningsVo.toPrimitives();
  }
}
