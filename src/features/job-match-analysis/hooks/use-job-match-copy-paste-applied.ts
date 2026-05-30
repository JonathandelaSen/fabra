"use client";

import { useQueryClient } from "@tanstack/react-query";
import { jobMatchAnalysisQueryKeys } from "../api/job-match-analysis-query-keys";
import type { JobMatchAnalysisDetailResponse, ListJobMatchAnalysesResponse } from "../types";

export function useJobMatchCopyPasteApplied(onApplied: () => void) {
  const queryClient = useQueryClient();
  const listKey = jobMatchAnalysisQueryKeys.lists();

  return (updated: JobMatchAnalysisDetailResponse) => {
    queryClient.setQueryData(jobMatchAnalysisQueryKeys.detail(updated.id), updated);
    queryClient.setQueryData<ListJobMatchAnalysesResponse>(
      listKey,
      (current) =>
        current?.map((item) =>
          item.id === updated.id
            ? { ...item, aiScore: updated.aiScore, aiAnalyzedAt: updated.aiAnalyzedAt }
            : item,
        ) ?? current,
    );
    onApplied();
  };
}
