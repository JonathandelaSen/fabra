"use client";

import type { EvidenceCandidateResponse } from "@/app/api/reviews/responses";
import type { SaveReviewInput } from "../api/performance-review-api";
import { usePerformanceReviewMutations } from "./use-performance-review-mutations";

export function usePerformanceReviewActions(reviewId: string | null) {
  const mutations = usePerformanceReviewMutations(reviewId);

  return {
    isSaving:
      mutations.create.isPending ||
      mutations.update.isPending ||
      mutations.addCandidate.isPending ||
      mutations.addCustomEvidence.isPending ||
      mutations.updateEvidence.isPending ||
      mutations.removeEvidence.isPending ||
      mutations.reorder.isPending ||
      mutations.saveManual.isPending ||
      mutations.generate.isPending ||
      mutations.apply.isPending,
    isGenerating: mutations.generate.isPending,
    createReview: (input: SaveReviewInput) => mutations.create.mutateAsync(input),
    updateReview: (input: Partial<SaveReviewInput>) =>
      mutations.update.mutateAsync(input),
    deleteReview: (id: string) => mutations.remove.mutateAsync(id),
    addCandidate: (candidate: EvidenceCandidateResponse) =>
      mutations.addCandidate.mutateAsync(candidate),
    addCustomEvidence: (content: string) =>
      mutations.addCustomEvidence.mutateAsync(content),
    toggleHighlight: (itemId: string, highlighted: boolean) =>
      mutations.updateEvidence.mutateAsync({ itemId, highlighted }),
    removeEvidence: (itemId: string) =>
      mutations.removeEvidence.mutateAsync(itemId),
    reorderEvidence: (orderedItemIds: string[]) =>
      mutations.reorder.mutateAsync(orderedItemIds),
    saveManual: (content: string) => mutations.saveManual.mutateAsync(content),
    generateIntegrated: (input: {
      provider: string;
      apiKey?: string;
      model: string;
    }) => mutations.generate.mutateAsync(input),
    prepareCopyPaste: () => mutations.prepare.mutateAsync(),
    applyCopyPaste: (envelope: unknown) => mutations.apply.mutateAsync(envelope),
  };
}
