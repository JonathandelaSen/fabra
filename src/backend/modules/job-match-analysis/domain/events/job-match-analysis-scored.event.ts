import type { DomainEvent } from "@/modules/shared";

export class JobMatchAnalysisScoredEvent
  implements DomainEvent<{ analysisId: string; score: number; aiModel: string }>
{
  readonly eventName = "job_match_analysis_scored";
  readonly occurredAt = new Date();

  constructor(
    private readonly analysisId: string,
    private readonly score: number,
    private readonly aiModel: string
  ) {}

  toPrimitives(): { analysisId: string; score: number; aiModel: string } {
    return { analysisId: this.analysisId, score: this.score, aiModel: this.aiModel };
  }
}
