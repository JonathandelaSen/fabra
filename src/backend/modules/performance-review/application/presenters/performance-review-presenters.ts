import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import type { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import type { EvidenceCandidate } from "../../domain/value-objects/evidence-candidate.value-object";

export function presentPerformanceReview(review: PerformanceReview) {
  const p = review.toPrimitives();
  return {
    id: p.id,
    activityContextId: p.activityContextId,
    title: p.title,
    reviewType: p.reviewType,
    reviewDate: p.reviewDate,
    periodStart: p.periodStart,
    periodEnd: p.periodEnd,
    status: p.status,
    selfAssessmentContent: p.selfAssessmentContent,
    selfAssessmentGeneratedAt: p.selfAssessmentGeneratedAt,
    selfAssessmentMode: p.selfAssessmentMode,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function presentPerformanceReviews(reviews: PerformanceReview[]) {
  return reviews.map(presentPerformanceReview);
}

export function presentReviewEvidenceItem(item: ReviewEvidenceItem) {
  const p = item.toPrimitives();
  return {
    id: p.id,
    reviewId: p.reviewId,
    source: p.source,
    sourceId: p.sourceId,
    content: p.content,
    highlighted: p.highlighted,
    position: p.position,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function presentReviewEvidenceItems(items: ReviewEvidenceItem[]) {
  return items.map(presentReviewEvidenceItem);
}

export function presentEvidenceCandidate(candidate: EvidenceCandidate) {
  return {
    source: candidate.source,
    sourceId: candidate.sourceId,
    date: candidate.date,
    content: candidate.content,
  };
}

export function presentEvidenceCandidates(candidates: EvidenceCandidate[]) {
  return candidates.map(presentEvidenceCandidate);
}

export type PerformanceReviewView = ReturnType<typeof presentPerformanceReview>;
export type ReviewEvidenceItemView = ReturnType<
  typeof presentReviewEvidenceItem
>;
export type EvidenceCandidateView = ReturnType<typeof presentEvidenceCandidate>;
