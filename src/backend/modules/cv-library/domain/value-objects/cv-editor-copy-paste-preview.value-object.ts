import {
  Counter,
  CopyPasteOriginLabel,
  LongText,
  StringList,
  ValueObject,
} from "@/backend/modules/shared";

export interface CVEditorCopyPastePreviewPrimitives {
  basicsName: string | null;
  sectionsCount: number;
  changedSections: string[];
  originLabel: "external_chat";
}

export class CVEditorCopyPastePreview extends ValueObject<CVEditorCopyPastePreviewPrimitives> {
  private constructor(
    private readonly basicsNameValue: LongText | null,
    private readonly sectionsCountValue: Counter,
    private readonly changedSectionsValue: StringList,
    private readonly originLabelValue: CopyPasteOriginLabel,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVEditorCopyPastePreviewPrimitives,
  ): CVEditorCopyPastePreview {
    return new CVEditorCopyPastePreview(
      primitives.basicsName === null
        ? null
        : LongText.fromPrimitives(primitives.basicsName),
      Counter.fromPrimitives(primitives.sectionsCount),
      StringList.fromPrimitives(primitives.changedSections),
      CopyPasteOriginLabel.fromPrimitives(primitives.originLabel),
    );
  }

  toPrimitives(): CVEditorCopyPastePreviewPrimitives {
    return {
      basicsName: this.basicsNameValue?.toPrimitives() ?? null,
      sectionsCount: this.sectionsCountValue.toPrimitives(),
      changedSections: this.changedSectionsValue.toPrimitives(),
      originLabel: this.originLabelValue.toPrimitives(),
    };
  }
}
