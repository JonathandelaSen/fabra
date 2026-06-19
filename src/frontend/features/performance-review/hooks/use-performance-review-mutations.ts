import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EvidenceCandidateResponse } from "@/app/api/reviews/responses";
import {
  addEvidenceItem,
  addCandidateAsEvidence,
  applySelfAssessmentCopyPaste,
  createReview,
  deleteReview,
  generateSelfAssessment,
  prepareSelfAssessmentCopyPaste,
  removeEvidenceItem,
  reorderEvidence,
  saveManualSelfAssessment,
  updateEvidenceItem,
  updateReview,
  type SaveReviewInput,
} from "../api/performance-review-api";
import { performanceReviewQueryKeys } from "../api/performance-review-query-keys";

export function usePerformanceReviewMutations(reviewId: string | null) {
  const queryClient = useQueryClient();
  const id = reviewId ?? "";

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: performanceReviewQueryKeys.list(),
    });
  const invalidateDetail = () =>
    queryClient.invalidateQueries({
      queryKey: performanceReviewQueryKeys.detail(id),
    });
  const invalidateEvidence = () =>
    queryClient.invalidateQueries({
      queryKey: performanceReviewQueryKeys.evidence(id),
    });
  const invalidateCandidates = () =>
    queryClient.invalidateQueries({
      queryKey: performanceReviewQueryKeys.candidates(id),
    });

  const create = useMutation({
    mutationFn: (input: SaveReviewInput) => createReview(input),
    onSuccess: invalidateList,
  });

  const update = useMutation({
    mutationFn: (input: Partial<SaveReviewInput>) => updateReview(id, input),
    onSuccess: () => {
      invalidateList();
      invalidateDetail();
      invalidateCandidates();
    },
  });

  const remove = useMutation({
    mutationFn: (targetId: string) => deleteReview(targetId),
    onSuccess: invalidateList,
  });

  const addCandidate = useMutation({
    mutationFn: (candidate: EvidenceCandidateResponse) =>
      addCandidateAsEvidence(id, candidate),
    onSuccess: invalidateEvidence,
  });

  const addCustomEvidence = useMutation({
    mutationFn: (content: string) =>
      addEvidenceItem(id, {
        source: "custom",
        sourceId: null,
        content,
      }),
    onSuccess: invalidateEvidence,
  });

  const updateEvidence = useMutation({
    mutationFn: (input: {
      itemId: string;
      content?: string;
      highlighted?: boolean;
    }) =>
      updateEvidenceItem(id, input.itemId, {
        content: input.content,
        highlighted: input.highlighted,
      }),
    onSuccess: invalidateEvidence,
  });

  const removeEvidence = useMutation({
    mutationFn: (itemId: string) => removeEvidenceItem(id, itemId),
    onSuccess: invalidateEvidence,
  });

  const reorder = useMutation({
    mutationFn: (orderedItemIds: string[]) => reorderEvidence(id, orderedItemIds),
    onSuccess: invalidateEvidence,
  });

  const saveManual = useMutation({
    mutationFn: (content: string) => saveManualSelfAssessment(id, content),
    onSuccess: () => {
      invalidateDetail();
      invalidateList();
    },
  });

  const generate = useMutation({
    mutationFn: (input: { provider: string; apiKey?: string; model: string }) =>
      generateSelfAssessment(id, input),
    onSuccess: () => {
      invalidateDetail();
      invalidateList();
    },
  });

  const prepare = useMutation({
    mutationFn: () => prepareSelfAssessmentCopyPaste(id),
  });

  const apply = useMutation({
    mutationFn: (envelope: unknown) => applySelfAssessmentCopyPaste(id, envelope),
    onSuccess: () => {
      invalidateDetail();
      invalidateList();
    },
  });

  return {
    create,
    update,
    remove,
    addCandidate,
    addCustomEvidence,
    updateEvidence,
    removeEvidence,
    reorder,
    saveManual,
    generate,
    prepare,
    apply,
  };
}
