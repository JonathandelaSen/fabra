import type { DomainEvent } from "@/backend/modules/shared";

export class JobMatchAnalysisJobUrlUpdatedEvent
  implements DomainEvent<{ analysisId: string; jobUrl: string | null }>
{
  readonly eventName = "job_match_analysis_job_url_updated";
  readonly occurredAt = new Date();

  constructor(
    private readonly analysisId: string,
    private readonly jobUrl: string | null
  ) {}

  toPrimitives(): { analysisId: string; jobUrl: string | null } {
    return { analysisId: this.analysisId, jobUrl: this.jobUrl };
  }
}
