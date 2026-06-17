import type { CopyPastePreparationPrimitives } from "@/modules/shared";

export interface PerformanceReviewResponse {
  id: string;
  activityContextId: string | null;
  title: string;
  reviewType: string;
  reviewDate: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  selfAssessmentContent: string | null;
  selfAssessmentGeneratedAt: string | null;
  selfAssessmentMode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEvidenceItemResponse {
  id: string;
  reviewId: string;
  source: string;
  sourceId: string | null;
  content: string;
  highlighted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceCandidateResponse {
  source: string;
  sourceId: string;
  date: string | null;
  content: string;
}

export type SelfAssessmentCopyPasteResponse = CopyPastePreparationPrimitives;

export type ListPerformanceReviewsResponse = PerformanceReviewResponse[];
export type PerformanceReviewDetailResponse = PerformanceReviewResponse;
export type ListEvidenceItemsResponse = ReviewEvidenceItemResponse[];
export type ListEvidenceCandidatesResponse = EvidenceCandidateResponse[];

export interface DeleteReviewResponse {
  ok: boolean;
}
