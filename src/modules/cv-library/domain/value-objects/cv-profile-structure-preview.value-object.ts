import { ValueObject, StringList } from "@/modules/shared";
import type { StandardCVProfilePrimitives } from "../cv-profile";
import type { CVProfileStructureCopyPastePreviewPrimitives } from "./cv-profile-structure-copy-paste-preview.value-object";
import { CVProfileStructureCopyPastePreview } from "./cv-profile-structure-copy-paste-preview.value-object";

export interface CVProfileStructurePreviewPrimitives {
  parsedResult: StandardCVProfilePrimitives;
  preview: CVProfileStructureCopyPastePreviewPrimitives;
  warnings: string[];
}

export class CVProfileStructurePreview extends ValueObject<CVProfileStructurePreviewPrimitives> {
  private constructor(
    private readonly parsedProfile: StandardCVProfilePrimitives,
    private readonly previewVo: CVProfileStructureCopyPastePreview,
    private readonly warningsVo: StringList
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVProfileStructurePreviewPrimitives
  ): CVProfileStructurePreview {
    return new CVProfileStructurePreview(
      primitives.parsedResult,
      CVProfileStructureCopyPastePreview.fromPrimitives(primitives.preview),
      StringList.fromPrimitives(primitives.warnings)
    );
  }

  toPrimitives(): CVProfileStructurePreviewPrimitives {
    return {
      parsedResult: this.parsedProfile,
      preview: this.previewVo.toPrimitives(),
      warnings: this.warningsVo.toPrimitives(),
    };
  }

  get parsedResult(): StandardCVProfilePrimitives {
    return this.parsedProfile;
  }

  get preview(): CVProfileStructureCopyPastePreviewPrimitives {
    return this.previewVo.toPrimitives();
  }

  get warnings(): string[] {
    return this.warningsVo.toPrimitives();
  }
}
