import { useQuery } from "@tanstack/react-query";
import {
  getReview,
  listActivityContexts,
  listEvidenceCandidates,
  listEvidenceItems,
  listReviews,
} from "../api/performance-review-api";
import { performanceReviewQueryKeys } from "../api/performance-review-query-keys";

export function useReviewsList() {
  return useQuery({
    queryKey: performanceReviewQueryKeys.list(),
    queryFn: listReviews,
  });
}

export function useReviewDetail(id: string | null) {
  return useQuery({
    queryKey: performanceReviewQueryKeys.detail(id ?? ""),
    queryFn: () => getReview(id as string),
    enabled: Boolean(id),
  });
}

export function useEvidenceItems(id: string | null) {
  return useQuery({
    queryKey: performanceReviewQueryKeys.evidence(id ?? ""),
    queryFn: () => listEvidenceItems(id as string),
    enabled: Boolean(id),
  });
}

export function useEvidenceCandidates(id: string | null) {
  return useQuery({
    queryKey: performanceReviewQueryKeys.candidates(id ?? ""),
    queryFn: () => listEvidenceCandidates(id as string),
    enabled: Boolean(id),
  });
}

export function useReviewActivityContexts() {
  return useQuery({
    queryKey: performanceReviewQueryKeys.contexts(),
    queryFn: listActivityContexts,
  });
}
