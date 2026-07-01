import { ValueObject } from "@/backend/modules/shared";
import type { CVAnalysisExtractedTextPrimitives } from "../entities/cv-analysis.entity";
import type { CVAnalysisDetailsPrimitives } from "./cv-analysis-details.primitives";

export type { CVAnalysisDetailsPrimitives } from "./cv-analysis-details.primitives";

class CVAnalysisDetailsValue extends ValueObject<unknown> {
  private constructor(private readonly details: CVAnalysisDetailsPrimitives) { super(); }
  static fromPrimitives(value: CVAnalysisDetailsPrimitives): CVAnalysisDetailsValue {
    return new CVAnalysisDetailsValue(structuredClone(value));
  }
  toPrimitives(): CVAnalysisDetailsPrimitives { return structuredClone(this.details); }
}

export class CVAnalysisDetails extends ValueObject<CVAnalysisDetailsPrimitives> {
  private constructor(private readonly value: CVAnalysisDetailsValue) {
    super();
  }

  static fromPrimitives(
    primitives: CVAnalysisDetailsPrimitives,
  ): CVAnalysisDetails {
    return new CVAnalysisDetails(CVAnalysisDetailsValue.fromPrimitives(primitives));
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
      ...this.value.toPrimitives(),
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
    return { ...this.value.toPrimitives().extractedText };
  }

  toPrimitives(): CVAnalysisDetailsPrimitives {
    return this.value.toPrimitives();
  }
}
