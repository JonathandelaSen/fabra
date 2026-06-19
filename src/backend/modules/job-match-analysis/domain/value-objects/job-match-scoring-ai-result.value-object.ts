import { Counter, LongText, StringList, ValueObject } from "@/modules/shared";
import type { JobMatchScoringAIResultPrimitives } from "../repositories/job-match-scoring-ai.service";
import { JobMatchJobKeyData } from "./job-match-job-key-data.value-object";

export class JobMatchScoringAIResultVO extends ValueObject<JobMatchScoringAIResultPrimitives> {
  private constructor(
    private readonly scoreValue: Counter,
    private readonly feedbackValue: LongText,
    private readonly aiKeywordsValue: StringList,
    private readonly improvementsValue: StringList,
    private readonly jobKeyDataValue: JobMatchJobKeyData,
    private readonly jobKeywordsValue: StringList,
    private readonly cvKeywordsValue: StringList,
    private readonly matchingKeywordsValue: StringList,
    private readonly missingKeywordsValue: StringList
  ) {
    super();
  }

  static fromPrimitives(primitives: JobMatchScoringAIResultPrimitives): JobMatchScoringAIResultVO {
    return new JobMatchScoringAIResultVO(
      Counter.fromPrimitives(primitives.score),
      LongText.fromPrimitives(primitives.feedback),
      StringList.fromPrimitives(primitives.aiKeywords),
      StringList.fromPrimitives(primitives.improvements),
      JobMatchJobKeyData.fromPrimitives(primitives.jobKeyData),
      StringList.fromPrimitives(primitives.jobKeywords),
      StringList.fromPrimitives(primitives.cvKeywords),
      StringList.fromPrimitives(primitives.matchingKeywords),
      StringList.fromPrimitives(primitives.missingKeywords)
    );
  }

  toPrimitives(): JobMatchScoringAIResultPrimitives {
    return {
      score: this.scoreValue.toPrimitives(),
      feedback: this.feedbackValue.toPrimitives(),
      aiKeywords: this.aiKeywordsValue.toPrimitives(),
      improvements: this.improvementsValue.toPrimitives(),
      jobKeyData: this.jobKeyDataValue.toPrimitives(),
      jobKeywords: this.jobKeywordsValue.toPrimitives(),
      cvKeywords: this.cvKeywordsValue.toPrimitives(),
      matchingKeywords: this.matchingKeywordsValue.toPrimitives(),
      missingKeywords: this.missingKeywordsValue.toPrimitives(),
    };
  }
}
