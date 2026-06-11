import type { ListActivityContextsResponse } from "@/app/api/activity-contexts/responses";
import type {
  EvidenceCandidateResponse,
  ListEvidenceCandidatesResponse,
  ListEvidenceItemsResponse,
  ListPerformanceReviewsResponse,
  PerformanceReviewResponse,
  ReviewEvidenceItemResponse,
  SelfAssessmentCopyPasteResponse,
} from "@/app/api/reviews/responses";

export type PerformanceReviewItem = ListPerformanceReviewsResponse[number];
export type EvidenceItem = ListEvidenceItemsResponse[number];
export type EvidenceCandidate = ListEvidenceCandidatesResponse[number];
export type ActivityContext = ListActivityContextsResponse["contexts"][number];
export type { SelfAssessmentCopyPasteResponse };

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || fallback);
  return data;
}

export interface SaveReviewInput {
  title: string;
  reviewType: string;
  reviewDate: string;
  periodStart: string;
  periodEnd: string;
  activityContextId: string | null;
}

export async function listActivityContexts() {
  const res = await fetch("/api/activity-contexts");
  return readJson<ListActivityContextsResponse>(
    res,
    "Could not load contexts.",
  );
}

export async function listReviews() {
  const res = await fetch("/api/reviews");
  return readJson<ListPerformanceReviewsResponse>(
    res,
    "Could not load reviews.",
  );
}

export async function getReview(id: string) {
  const res = await fetch(`/api/reviews/${id}`);
  return readJson<PerformanceReviewResponse>(res, "Could not load the review.");
}

export async function createReview(input: SaveReviewInput) {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<PerformanceReviewResponse>(res, "Could not create review.");
}

export async function updateReview(id: string, input: Partial<SaveReviewInput>) {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<PerformanceReviewResponse>(res, "Could not update review.");
}

export async function deleteReview(id: string) {
  const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
  return readJson<{ ok: boolean }>(res, "Could not delete review.");
}

export async function listEvidenceCandidates(reviewId: string) {
  const res = await fetch(`/api/reviews/${reviewId}/evidence/candidates`);
  return readJson<ListEvidenceCandidatesResponse>(
    res,
    "Could not load evidence candidates.",
  );
}

export async function listEvidenceItems(reviewId: string) {
  const res = await fetch(`/api/reviews/${reviewId}/evidence`);
  return readJson<ListEvidenceItemsResponse>(
    res,
    "Could not load curated evidence.",
  );
}

export async function addEvidenceItem(
  reviewId: string,
  input: {
    source: string;
    sourceId: string | null;
    content: string;
    highlighted?: boolean;
  },
) {
  const res = await fetch(`/api/reviews/${reviewId}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<ReviewEvidenceItemResponse>(res, "Could not add evidence.");
}

export async function addCandidateAsEvidence(
  reviewId: string,
  candidate: EvidenceCandidateResponse,
) {
  return addEvidenceItem(reviewId, {
    source: candidate.source,
    sourceId: candidate.sourceId,
    content: candidate.content,
  });
}

export async function updateEvidenceItem(
  reviewId: string,
  itemId: string,
  input: { content?: string; highlighted?: boolean },
) {
  const res = await fetch(`/api/reviews/${reviewId}/evidence/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<ReviewEvidenceItemResponse>(res, "Could not update evidence.");
}

export async function removeEvidenceItem(reviewId: string, itemId: string) {
  const res = await fetch(`/api/reviews/${reviewId}/evidence/${itemId}`, {
    method: "DELETE",
  });
  return readJson<{ ok: boolean }>(res, "Could not remove evidence.");
}

export async function reorderEvidence(reviewId: string, orderedItemIds: string[]) {
  const res = await fetch(`/api/reviews/${reviewId}/evidence/order`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedItemIds }),
  });
  return readJson<ListEvidenceItemsResponse>(res, "Could not reorder evidence.");
}

export async function saveManualSelfAssessment(reviewId: string, content: string) {
  const res = await fetch(`/api/reviews/${reviewId}/self-assessment`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return readJson<PerformanceReviewResponse>(
    res,
    "Could not save the self-assessment.",
  );
}

export async function generateSelfAssessment(
  reviewId: string,
  input: { provider: string; apiKey?: string; model: string },
) {
  const res = await fetch(`/api/reviews/${reviewId}/self-assessment/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<PerformanceReviewResponse>(
    res,
    "Could not generate the self-assessment.",
  );
}

export async function prepareSelfAssessmentCopyPaste(reviewId: string) {
  const res = await fetch(`/api/reviews/${reviewId}/self-assessment/prepare`, {
    method: "POST",
  });
  return readJson<SelfAssessmentCopyPasteResponse>(
    res,
    "Could not prepare the copy-paste prompt.",
  );
}

export async function applySelfAssessmentCopyPaste(
  reviewId: string,
  envelope: unknown,
) {
  const res = await fetch(`/api/reviews/${reviewId}/self-assessment/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envelope),
  });
  return readJson<PerformanceReviewResponse>(
    res,
    "Could not apply the pasted response.",
  );
}
