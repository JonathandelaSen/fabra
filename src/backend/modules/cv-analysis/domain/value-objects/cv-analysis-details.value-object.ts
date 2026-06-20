import { ValueObject } from "@/backend/modules/shared";
import type { CVAnalysisExtractedTextPrimitives } from "../entities/cv-analysis.entity";
import type { CVAnalysisDetailsPrimitives } from "./cv-analysis-details.primitives";

export type { CVAnalysisDetailsPrimitives } from "./cv-analysis-details.primitives";

export class CVAnalysisDetails extends ValueObject<CVAnalysisDetailsPrimitives> {
  private constructor(private readonly value: CVAnalysisDetailsPrimitives) {
    super();
  }

  static fromPrimitives(
    primitives: CVAnalysisDetailsPrimitives,
  ): CVAnalysisDetails {
    return new CVAnalysisDetails({
      ...primitives,
      extractedText: { ...primitives.extractedText },
      keywords: [...primitives.keywords],
      improvements: [...primitives.improvements],
    });
  }

  withAIResult(input: {
    aiModel: string;
    score: number;
    feedback: string;
    keywords: string[];
    improvements: string[];
    aiContext: unknown | null;
    analyzedAt: string;
  }): CVAnalysisDetails {
    return CVAnalysisDetails.fromPrimitives({
      ...this.value,
      aiModel: input.aiModel,
      score: input.score,
      feedback: input.feedback,
      keywords: input.keywords,
      improvements: input.improvements,
      aiContext: input.aiContext,
      analyzedAt: input.analyzedAt,
    });
  }

  getExtractedText(): CVAnalysisExtractedTextPrimitives {
    return { ...this.value.extractedText };
  }

  toPrimitives(): CVAnalysisDetailsPrimitives {
    return {
      ...this.value,
      extractedText: { ...this.value.extractedText },
      keywords: [...this.value.keywords],
      improvements: [...this.value.improvements],
    };
  }
}
