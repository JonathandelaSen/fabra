import { ValueObject, StringList } from "@/backend/modules/shared";
import { CVProfile, type CVProfilePrimitives } from "./cv-profile.value-object";
import type { CVProfileStructureCopyPastePreviewPrimitives } from "./cv-profile-structure-copy-paste-preview.value-object";
import { CVProfileStructureCopyPastePreview } from "./cv-profile-structure-copy-paste-preview.value-object";

export interface CVProfileStructurePreviewPrimitives {
  parsedResult: CVProfilePrimitives;
  preview: CVProfileStructureCopyPastePreviewPrimitives;
  warnings: string[];
}

export class CVProfileStructurePreview extends ValueObject<CVProfileStructurePreviewPrimitives> {
  private constructor(
    private readonly parsedProfile: CVProfile,
    private readonly previewVo: CVProfileStructureCopyPastePreview,
    private readonly warningsVo: StringList,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVProfileStructurePreviewPrimitives,
  ): CVProfileStructurePreview {
    return new CVProfileStructurePreview(
      CVProfile.fromPrimitives(primitives.parsedResult),
      CVProfileStructureCopyPastePreview.fromPrimitives(primitives.preview),
      StringList.fromPrimitives(primitives.warnings),
    );
  }

  toPrimitives(): CVProfileStructurePreviewPrimitives {
    return {
      parsedResult: this.parsedProfile.toPrimitives(),
      preview: this.previewVo.toPrimitives(),
      warnings: this.warningsVo.toPrimitives(),
    };
  }

  get parsedResult(): CVProfilePrimitives {
    return this.parsedProfile.toPrimitives();
  }

  get preview(): CVProfileStructureCopyPastePreviewPrimitives {
    return this.previewVo.toPrimitives();
  }

  get warnings(): string[] {
    return this.warningsVo.toPrimitives();
  }
}
