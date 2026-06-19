import { UserId, type QueryBus } from "@/backend/modules/shared";
import { ListCommitmentsInRangeQuery, type CommitmentPrimitives } from "@/backend/modules/commitments";
import { ListJournalEntriesInRangeQuery, type WorkJournalEntryPrimitives } from "@/backend/modules/work-journal";
import { ListReceivedFeedbackInRangeQuery, type ReceivedFeedbackPrimitives } from "@/backend/modules/received-feedback";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import { EVIDENCE_SOURCE } from "../../domain/value-objects/evidence-source.value-object";
import { EvidenceCandidate } from "../../domain/value-objects/evidence-candidate.value-object";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";

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

    const [journal, feedback, commitments] = await Promise.all([
      this.deps.queryBus.execute<WorkJournalEntryPrimitives[]>(
        new ListJournalEntriesInRangeQuery(range),
      ),
      this.deps.queryBus.execute<ReceivedFeedbackPrimitives[]>(
        new ListReceivedFeedbackInRangeQuery(range),
      ),
      this.deps.queryBus.execute<CommitmentPrimitives[]>(
        new ListCommitmentsInRangeQuery(range),
      ),
    ]);

    return [
      ...journal.map((p) => {
        const content = p.finalText?.trim() || p.rawNotes?.trim() || p.topic || "";
        return EvidenceCandidate.fromPrimitives({
          sourceId: p.id,
          date: p.dateStart,
          content,
          source: EVIDENCE_SOURCE.journalEntry,
        });
      }),
      ...feedback.map((p) =>
        EvidenceCandidate.fromPrimitives({
          sourceId: p.id,
          date: p.receivedDate,
          content: `${p.giverName}: ${p.feedbackText}`,
          source: EVIDENCE_SOURCE.receivedFeedback,
        }),
      ),
      ...commitments.map((c) => {
        const parts = [c.title];
        if (c.resultNotes) parts.push(c.resultNotes);
        else if (c.description) parts.push(c.description);
        return EvidenceCandidate.fromPrimitives({
          sourceId: c.id,
          date: c.targetDate ?? c.startDate,
          content: parts.join(" — "),
          source: EVIDENCE_SOURCE.commitment,
        });
      }),
    ];
  }
}
