import { ValueObject } from "@/modules/shared";

export interface CVEditorCopyPastePreviewPrimitives {
  basicsName: string | null;
  sectionsCount: number;
  changedSections: string[];
  originLabel: "external_chat";
}

export class CVEditorCopyPastePreview extends ValueObject<CVEditorCopyPastePreviewPrimitives> {
  private constructor(private readonly value: CVEditorCopyPastePreviewPrimitives) {
    super();
  }

  static fromPrimitives(primitives: CVEditorCopyPastePreviewPrimitives): CVEditorCopyPastePreview {
    return new CVEditorCopyPastePreview(primitives);
  }

  toPrimitives(): CVEditorCopyPastePreviewPrimitives {
    return this.value;
  }
}
