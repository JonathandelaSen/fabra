import { ValueObject } from "@/modules/shared";

export interface JobAnalysisChatContextPrimitives {
  analysisId: string;
  cvId: string | null;
  analysisMode: string;
  analysis: unknown;
  cv: unknown;
  cvText: string | null;
}

export class JobAnalysisChatContext extends ValueObject<JobAnalysisChatContextPrimitives> {
  private constructor(
    public readonly analysisId: string,
    public readonly cvId: string | null,
    public readonly analysisMode: string,
    public readonly analysis: unknown,
    public readonly cv: unknown,
    public readonly cvText: string | null
  ) {
    super();
  }

  static fromPrimitives(primitives: JobAnalysisChatContextPrimitives): JobAnalysisChatContext {
    return new JobAnalysisChatContext(
      primitives.analysisId,
      primitives.cvId,
      primitives.analysisMode,
      primitives.analysis,
      primitives.cv,
      primitives.cvText
    );
  }

  toPrimitives(): JobAnalysisChatContextPrimitives {
    return {
      analysisId: this.analysisId,
      cvId: this.cvId,
      analysisMode: this.analysisMode,
      analysis: this.analysis,
      cv: this.cv,
      cvText: this.cvText,
    };
  }
}
