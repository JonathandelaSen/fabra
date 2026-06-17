import { ValueObject } from "@/modules/shared";

export interface CVProfileStructureCopyPastePreviewPrimitives {
  basicsName: string | null;
  sectionsCount: number;
  missingImportantFields: string[];
  templateLocale: string | null;
  completeness: number;
  originLabel: "external_chat";
}

export class CVProfileStructureCopyPastePreview extends ValueObject<CVProfileStructureCopyPastePreviewPrimitives> {
  private constructor(private readonly value: CVProfileStructureCopyPastePreviewPrimitives) {
    super();
  }

  static fromPrimitives(
    primitives: CVProfileStructureCopyPastePreviewPrimitives
  ): CVProfileStructureCopyPastePreview {
    return new CVProfileStructureCopyPastePreview(primitives);
  }

  toPrimitives(): CVProfileStructureCopyPastePreviewPrimitives {
    return this.value;
  }
}
