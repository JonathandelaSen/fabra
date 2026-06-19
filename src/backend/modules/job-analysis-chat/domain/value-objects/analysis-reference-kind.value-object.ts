import { ValueObject } from "@/backend/modules/shared";

export const analysisReferenceTypes = {
  jobMatchAnalysis: "job_match_analysis",
  cvAnalysis: "cv_analysis",
} as const;

export type AnalysisReferenceType =
  (typeof analysisReferenceTypes)[keyof typeof analysisReferenceTypes];

const validTypes = new Set<AnalysisReferenceType>([
  analysisReferenceTypes.jobMatchAnalysis,
  analysisReferenceTypes.cvAnalysis,
]);

export class AnalysisReferenceKind extends ValueObject<AnalysisReferenceType> {
  private constructor(private readonly value: AnalysisReferenceType) {
    super();
  }

  static fromPrimitives(value: string): AnalysisReferenceKind {
    if (!validTypes.has(value as AnalysisReferenceType)) {
      throw new Error("Analysis reference type is not supported.");
    }
    return new AnalysisReferenceKind(value as AnalysisReferenceType);
  }

  toPrimitives(): AnalysisReferenceType {
    return this.value;
  }
}
