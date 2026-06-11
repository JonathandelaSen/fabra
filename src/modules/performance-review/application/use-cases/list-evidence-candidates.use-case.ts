import { UserId, type QueryBus } from "@/modules/shared";
import { ListCommitmentsInRangeQuery } from "@/modules/commitments";
import { ListJournalEntriesInRangeQuery } from "@/modules/work-journal";
import { ListReceivedFeedbackInRangeQuery } from "@/modules/received-feedback";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import {
  EVIDENCE_SOURCE,
  type EvidenceSourceValue,
} from "../../domain/value-objects/evidence-source.value-object";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";

export interface EvidenceCandidate {
  source: EvidenceSourceValue;
  sourceId: string;
  date: string | null;
  content: string;
}

export interface ListEvidenceCandidatesInput {
  reviewId: string;
  userId: string;
}

export class ListEvidenceCandidatesUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      queryBus: QueryBus;
    },
  ) {}

  async execute(
    input: ListEvidenceCandidatesInput,
  ): Promise<EvidenceCandidate[]> {
    const userId = UserId.fromPrimitives(input.userId);
    const review = await this.deps.reviewRepo.findById(
      PerformanceReviewId.fromPrimitives(input.reviewId),
      userId,
    );
    if (!review) throw new PerformanceReviewNotFoundError();

    const { periodStart, periodEnd, activityContextId } = review.toPrimitives();
    const range = {
      userId: input.userId,
      dateFrom: periodStart,
      dateTo: periodEnd,
      contextId: activityContextId,
    };

    type RangeResult = { sourceId: string; date: string | null; content: string }[];
    const [journal, feedback, commitments] = await Promise.all([
      this.deps.queryBus.execute<RangeResult>(
        new ListJournalEntriesInRangeQuery(range),
      ),
      this.deps.queryBus.execute<RangeResult>(
        new ListReceivedFeedbackInRangeQuery(range),
      ),
      this.deps.queryBus.execute<RangeResult>(
        new ListCommitmentsInRangeQuery(range),
      ),
    ]);

    return [
      ...journal.map((c) => ({
        ...c,
        source: EVIDENCE_SOURCE.journalEntry,
      })),
      ...feedback.map((c) => ({
        ...c,
        source: EVIDENCE_SOURCE.receivedFeedback,
      })),
      ...commitments.map((c) => ({
        ...c,
        source: EVIDENCE_SOURCE.commitment,
      })),
    ];
  }
}
