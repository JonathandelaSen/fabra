"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { getErrorMessage } from "@/lib/errors";
import type { AIContext } from "@/lib/analysis-types";
import { useJobMatchAnalysisMutations } from "@/features/job-match-analysis";
import {
  useScoreCVAnalysis,
  type ScoreCVAnalysisInput,
} from "./use-cv-analysis-mutations";

import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";

interface ScoreAnalysisHandler {
  (id: string, input: ScoreCVAnalysisInput): Promise<void>;
}

interface UseExtractionAIActionsParams {
  analysisId: string;
  aiApiKey: string;
  aiModel: string;
  aiProvider: StoredAIProvider;
  hasAIApiKey: boolean;
  onAIAnalysisComplete: () => void;
  onScoreAnalysis?: ScoreAnalysisHandler;
}

export function useExtractionAIActions({
  analysisId,
  aiApiKey,
  aiModel,
  aiProvider,
  hasAIApiKey,
  onAIAnalysisComplete,
  onScoreAnalysis,
}: UseExtractionAIActionsParams) {
  const t = useTranslations("analysisFlow.extraction");
  const formsT = useTranslations("analysisFlow.forms");
  const scoreCVAnalysis = useScoreCVAnalysis();
  const jobMatchMutations = useJobMatchAnalysisMutations();
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copyPasteContext, setCopyPasteContext] = useState<string | null>(null);
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>(aiProvider);
  const [selectedModel, setSelectedModel] = useState<string>(
    aiModel || DEFAULT_GEMINI_MODEL,
  );

  const models = Object.entries(GEMINI_MODELS).map(([id, label]) => ({
    id,
    label: id === DEFAULT_GEMINI_MODEL ? `${label} (${formsT("powerful")})` : label,
  }));

  const handleGeneralAnalysis = async (context: AIContext) => {
    const aiConfig = getAIRequestConfigForProvider(selectedProvider, aiApiKey, selectedModel);
    if (aiConfig.error) {
      setAiError(aiConfig.error);
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      if (onScoreAnalysis) {
        await onScoreAnalysis(analysisId, {
          additionalContext: context?.additionalContext ?? null,
          provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            baseUrl: aiConfig.baseUrl,
            model: aiConfig.model,
        });
      } else {
        await scoreCVAnalysis.mutateAsync({
          id: analysisId,
          input: {
            additionalContext: context?.additionalContext ?? null,
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            baseUrl: aiConfig.baseUrl,
            model: aiConfig.model,
          },
        });
      }

      onAIAnalysisComplete();
    } catch (err: unknown) {
      setAiError(getErrorMessage(err));
    } finally {
      setLoadingAI(false);
    }
  };

  const handleExternalChatAnalysis = (context: AIContext) => {
    setCopyPasteContext(context.additionalContext ?? null);
    setCopyPasteOpen(true);
  };

  const handleJobMatchAnalysis = async (
    jobDescription: string,
    jobUrl: string,
  ) => {
    const aiConfig = getAIRequestConfigForProvider(selectedProvider, aiApiKey, selectedModel);
    if (aiConfig.error) {
      setAiError(aiConfig.error);
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      await jobMatchMutations.scoreAnalysis.mutateAsync({
        id: analysisId,
        input: {
          jobDescription,
          jobUrl: jobUrl || null,
          provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            baseUrl: aiConfig.baseUrl,
            model: aiConfig.model,
        },
      });

      onAIAnalysisComplete();
    } catch (err: unknown) {
      setAiError(getErrorMessage(err));
    } finally {
      setLoadingAI(false);
    }
  };

  return {
    aiError,
    copyPasteContext,
    copyPasteOpen,
    loadingAI,
    models,
    selectedModel,
    handleExternalChatAnalysis,
    handleGeneralAnalysis,
    handleJobMatchAnalysis,
    setCopyPasteContext,
    setCopyPasteOpen,
    selectedProvider,
    setSelectedProvider,
    setSelectedModel,
  };
}

export type { ScoreAnalysisHandler };
