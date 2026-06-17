import { StringList, ValueObject } from "@/modules/shared";
import type { JobMatchScoringAIResultPrimitives } from "../repositories/job-match-scoring-ai.service";
import { JobMatchScoringAIResultVO } from "./job-match-scoring-ai-result.value-object";
import type { JobMatchScorePreviewStatsPrimitives } from "./job-match-score-preview-stats.value-object";
import { JobMatchScorePreviewStats } from "./job-match-score-preview-stats.value-object";

export interface JobMatchScorePreviewPrimitives {
  parsedResult: JobMatchScoringAIResultPrimitives;
  preview: JobMatchScorePreviewStatsPrimitives;
  warnings: string[];
}

export class JobMatchScorePreview extends ValueObject<JobMatchScorePreviewPrimitives> {
  private constructor(
    private readonly parsedResultVo: JobMatchScoringAIResultVO,
    private readonly previewVo: JobMatchScorePreviewStats,
    private readonly warningsList: StringList
  ) {
    super();
  }

  static fromPrimitives(primitives: JobMatchScorePreviewPrimitives): JobMatchScorePreview {
    return new JobMatchScorePreview(
      JobMatchScoringAIResultVO.fromPrimitives(primitives.parsedResult),
      JobMatchScorePreviewStats.fromPrimitives(primitives.preview),
      StringList.fromPrimitives(primitives.warnings)
    );
  }

  toPrimitives(): JobMatchScorePreviewPrimitives {
    return {
      parsedResult: this.parsedResultVo.toPrimitives(),
      preview: this.previewVo.toPrimitives(),
      warnings: this.warningsList.toPrimitives(),
    };
  }

  get parsedResult(): JobMatchScoringAIResultPrimitives {
    return this.parsedResultVo.toPrimitives();
  }

  get preview(): JobMatchScorePreviewStatsPrimitives {
    return this.previewVo.toPrimitives();
  }

  get warnings(): readonly string[] {
    return this.warningsList.toPrimitives();
  }
}
