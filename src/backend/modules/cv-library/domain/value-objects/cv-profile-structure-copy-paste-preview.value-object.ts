import {
  Counter,
  CopyPasteOriginLabel,
  LongText,
  StringList,
  ValueObject,
} from "@/backend/modules/shared";

export interface CVProfileStructureCopyPastePreviewPrimitives {
  basicsName: string | null;
  sectionsCount: number;
  missingImportantFields: string[];
  templateLocale: string | null;
  completeness: number;
  originLabel: "external_chat";
}

export class CVProfileStructureCopyPastePreview extends ValueObject<CVProfileStructureCopyPastePreviewPrimitives> {
  private constructor(
    private readonly basicsNameValue: LongText | null,
    private readonly sectionsCountValue: Counter,
    private readonly missingImportantFieldsValue: StringList,
    private readonly templateLocaleValue: LongText | null,
    private readonly completenessValue: Counter,
    private readonly originLabelValue: CopyPasteOriginLabel
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVProfileStructureCopyPastePreviewPrimitives
  ): CVProfileStructureCopyPastePreview {
    return new CVProfileStructureCopyPastePreview(
      primitives.basicsName === null ? null : LongText.fromPrimitives(primitives.basicsName),
      Counter.fromPrimitives(primitives.sectionsCount),
      StringList.fromPrimitives(primitives.missingImportantFields),
      primitives.templateLocale === null ? null : LongText.fromPrimitives(primitives.templateLocale),
      Counter.fromPrimitives(primitives.completeness),
      CopyPasteOriginLabel.fromPrimitives(primitives.originLabel)
    );
  }

  toPrimitives(): CVProfileStructureCopyPastePreviewPrimitives {
    return {
      basicsName: this.basicsNameValue?.toPrimitives() ?? null,
      sectionsCount: this.sectionsCountValue.toPrimitives(),
      missingImportantFields: this.missingImportantFieldsValue.toPrimitives(),
      templateLocale: this.templateLocaleValue?.toPrimitives() ?? null,
      completeness: this.completenessValue.toPrimitives(),
      originLabel: this.originLabelValue.toPrimitives(),
    };
  }
}
