import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import type { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import type { ReviewSelfAssessmentAIInput } from "../../domain/repositories/review-self-assessment-ai.service";

export function buildReviewSelfAssessmentAIInput(
  review: PerformanceReview,
  items: ReviewEvidenceItem[],
): ReviewSelfAssessmentAIInput {
  const r = review.toPrimitives();
  return {
    title: r.title,
    reviewType: r.reviewType,
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    evidence: items
      .map((item) => item.toPrimitives())
      .map((p) => ({
        source: p.source,
        date: p.createdAt.slice(0, 10),
        content: p.content,
        highlighted: p.highlighted,
      })),
  };
}
