import { ValueObject } from "@/modules/shared";

export const analysisReferenceTypes = {
  jobMatchAnalysis: "job_match_analysis",
  cvAnalysis: "cv_analysis",
} as const;

export type AnalysisReferenceType =
  (typeof analysisReferenceTypes)[keyof typeof analysisReferenceTypes];

export interface AnalysisReferencePrimitives {
  readonly type: AnalysisReferenceType;
  readonly id: string;
}

const validTypes = new Set<AnalysisReferenceType>([
  analysisReferenceTypes.jobMatchAnalysis,
  analysisReferenceTypes.cvAnalysis,
]);

export class AnalysisReference extends ValueObject<AnalysisReferencePrimitives> {
  private constructor(private readonly value: AnalysisReferencePrimitives) {
    super();
    if (!validTypes.has(value.type)) {
      throw new Error("Analysis reference type is not supported.");
    }
    if (!value.id.trim())
      throw new Error("Analysis reference id cannot be empty.");
  }

  static fromPrimitives(value: AnalysisReferencePrimitives): AnalysisReference {
    return new AnalysisReference({
      type: value.type,
      id: value.id.trim(),
    });
  }

  toPrimitives(): AnalysisReferencePrimitives {
    return { ...this.value };
  }
}
