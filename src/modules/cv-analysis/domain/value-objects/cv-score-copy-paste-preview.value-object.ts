import { ValueObject } from "@/modules/shared";

export interface CVScoreCopyPastePreviewPrimitives {
  score: number;
  summary: string;
  strengthsCount: number;
  improvementAreasCount: number;
  recommendationsCount: number;
  originLabel: "external_chat";
  willReplaceExistingResult: boolean;
}

export class CVScoreCopyPastePreview extends ValueObject<CVScoreCopyPastePreviewPrimitives> {
  private constructor(private readonly value: CVScoreCopyPastePreviewPrimitives) {
    super();
  }

  static fromPrimitives(primitives: CVScoreCopyPastePreviewPrimitives): CVScoreCopyPastePreview {
    return new CVScoreCopyPastePreview(primitives);
  }

  toPrimitives(): CVScoreCopyPastePreviewPrimitives {
    return this.value;
  }
}
