import type { DomainEvent } from "@/modules/shared";

export class JobMatchAnalysisCreatedEvent implements DomainEvent<{ analysisId: string }> {
  readonly eventName = "job_match_analysis_created";
  readonly occurredAt = new Date();

  constructor(private readonly analysisId: string) {}

  toPrimitives(): { analysisId: string } {
    return { analysisId: this.analysisId };
  }
}
