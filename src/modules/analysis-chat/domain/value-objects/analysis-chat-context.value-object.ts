import { ValueObject } from "@/modules/shared";

export interface AnalysisChatContextPrimitives {
  analysisId: string;
  cvId: string | null;
  analysisMode: string;
  analysis: unknown;
  cv: unknown;
  cvText: string | null;
}

export class AnalysisChatContext extends ValueObject<AnalysisChatContextPrimitives> {
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

  static fromPrimitives(primitives: AnalysisChatContextPrimitives): AnalysisChatContext {
    return new AnalysisChatContext(
      primitives.analysisId,
      primitives.cvId,
      primitives.analysisMode,
      primitives.analysis,
      primitives.cv,
      primitives.cvText
    );
  }

  toPrimitives(): AnalysisChatContextPrimitives {
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
