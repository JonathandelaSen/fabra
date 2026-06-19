import type { DomainEvent } from "@/backend/modules/shared";

export class CVAnalysisCreatedEvent implements DomainEvent<{ analysisId: string }> {
  readonly eventName = "cv_analysis_created";
  readonly occurredAt = new Date();

  constructor(private readonly analysisId: string) {}

  toPrimitives(): { analysisId: string } {
    return { analysisId: this.analysisId };
  }
}
