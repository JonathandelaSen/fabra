"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import {
  getAIRequestConfigForProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import type { JobMatchAnalysisDetailResponse } from "../types";
import type { useJobMatchAnalysisMutations } from "./use-job-match-analysis-mutations";
import type { AnalysisTab } from "./use-job-match-analysis-route-state";

interface UseNewJobMatchFlowActionsParams {
  mutations: ReturnType<typeof useJobMatchAnalysisMutations>;
  aiApiKey: string;
  replaceAnalysis: (id: string) => void;
  goToAnalysisById: (id: string, tab?: AnalysisTab) => void;
}

interface NewJobMatchInput {
  cvId: string;
  title: string;
  jobDescription: string;
  jobUrl: string | null;
  model: string;
}

export function useNewJobMatchFlowActions({
  mutations,
  aiApiKey,
  replaceAnalysis,
  goToAnalysisById,
}: UseNewJobMatchFlowActionsParams) {
  const [newFlowError, setNewFlowError] = useState<string | null>(null);
  const [pendingCopyPasteAnalysis, setPendingCopyPasteAnalysis] =
    useState<JobMatchAnalysisDetailResponse | null>(null);

  const createCV = async (file: File, name: string) => {
    const cv = await mutations.uploadCV.mutateAsync({ file, name });
    return cv.id;
  };

  const createJobMatch = async (input: NewJobMatchInput) => {
    const analysis = await mutations.createAnalysis.mutateAsync(input);
    replaceAnalysis(analysis.id);
    return analysis;
  };

  const runNewIntegratedAnalysis = async (
    input: NewJobMatchInput & { provider: StoredAIProvider },
  ) => {
    setNewFlowError(null);
    try {
      const analysis = await createJobMatch({
        cvId: input.cvId,
        title: input.title,
        jobDescription: input.jobDescription,
        jobUrl: input.jobUrl,
        model: input.model,
      });
      const aiConfig = getAIRequestConfigForProvider(
        input.provider,
        aiApiKey,
        input.model,
      );
      if (aiConfig.error) throw new Error(aiConfig.error);
      await mutations.scoreAnalysis.mutateAsync({
        id: analysis.id,
        input: {
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          baseUrl: aiConfig.baseUrl,
          model: aiConfig.model,
          jobDescription: input.jobDescription,
          jobUrl: input.jobUrl,
        },
      });
      goToAnalysisById(analysis.id, "summary");
    } catch (error: unknown) {
      setNewFlowError(getErrorMessage(error));
    }
  };

  const openNewCopyPasteFlow = async (input: NewJobMatchInput) => {
    setNewFlowError(null);
    try {
      const analysis = await createJobMatch(input);
      setPendingCopyPasteAnalysis(analysis);
    } catch (error: unknown) {
      setNewFlowError(getErrorMessage(error));
    }
  };

  return {
    newFlowError,
    pendingCopyPasteAnalysis,
    setPendingCopyPasteAnalysis,
    createCV,
    runNewIntegratedAnalysis,
    openNewCopyPasteFlow,
  };
}
