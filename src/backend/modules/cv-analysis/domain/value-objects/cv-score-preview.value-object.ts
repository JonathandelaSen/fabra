import { ValueObject, StringList } from "@/backend/modules/shared";
import type { CVScoringAIResultPrimitives } from "../repositories/cv-scoring-ai.service";
import { CVScoringAIResult } from "./cv-scoring-ai-result.value-object";
import type { CVScoreCopyPastePreviewPrimitives } from "./cv-score-copy-paste-preview.value-object";
import { CVScoreCopyPastePreview } from "./cv-score-copy-paste-preview.value-object";

export interface CVScorePreviewPrimitives {
  parsedResult: CVScoringAIResultPrimitives;
  preview: CVScoreCopyPastePreviewPrimitives;
  warnings: string[];
}

export class CVScorePreview extends ValueObject<CVScorePreviewPrimitives> {
  private constructor(
    private readonly parsedResultVo: CVScoringAIResult,
    private readonly previewVo: CVScoreCopyPastePreview,
    private readonly warningsVo: StringList
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CVScorePreviewPrimitives
  ): CVScorePreview {
    return new CVScorePreview(
      CVScoringAIResult.fromPrimitives(primitives.parsedResult),
      CVScoreCopyPastePreview.fromPrimitives(primitives.preview),
      StringList.fromPrimitives(primitives.warnings)
    );
  }

  toPrimitives(): CVScorePreviewPrimitives {
    return {
      parsedResult: this.parsedResultVo.toPrimitives(),
      preview: this.previewVo.toPrimitives(),
      warnings: this.warningsVo.toPrimitives(),
    };
  }

  get parsedResult(): CVScoringAIResultPrimitives {
    return this.parsedResultVo.toPrimitives();
  }

  get preview(): CVScoreCopyPastePreviewPrimitives {
    return this.previewVo.toPrimitives();
  }

  get warnings(): string[] {
    return this.warningsVo.toPrimitives();
  }
}
