"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_FAST_GEMINI_MODEL, DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { getErrorMessage } from "@/lib/errors";
import type { AIContext } from "@/lib/analysis-types";
import { useJobMatchAnalysisMutations } from "@/features/job-match-analysis";
import {
  useScoreCVAnalysis,
  type ScoreCVAnalysisInput,
} from "./use-cv-analysis-mutations";

type AIProvider = "gemini" | "mock";

interface ScoreAnalysisHandler {
  (id: string, input: ScoreCVAnalysisInput): Promise<void>;
}

interface UseExtractionAIActionsParams {
  analysisId: string;
  aiApiKey: string;
  aiModel: string;
  aiProvider: AIProvider;
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
  const [selectedModel, setSelectedModel] = useState<string>(
    aiModel || DEFAULT_FAST_GEMINI_MODEL,
  );

  const models = [
    { id: DEFAULT_FAST_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_FAST_GEMINI_MODEL]} (${formsT("fast")})` },
    { id: DEFAULT_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_GEMINI_MODEL]} (${formsT("powerful")})` },
  ];

  const handleGeneralAnalysis = async (context: AIContext, model: string) => {
    if (!hasAIApiKey) {
      setAiError(t("missingApiKey"));
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      if (onScoreAnalysis) {
        await onScoreAnalysis(analysisId, {
          additionalContext: context?.additionalContext ?? null,
          provider: aiProvider,
          apiKey: aiApiKey,
          model,
        });
      } else {
        await scoreCVAnalysis.mutateAsync({
          id: analysisId,
          input: {
            additionalContext: context?.additionalContext ?? null,
            provider: aiProvider,
            apiKey: aiApiKey,
            model,
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
    model: string,
  ) => {
    if (!hasAIApiKey) {
      setAiError(t("missingApiKey"));
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
          provider: aiProvider,
          apiKey: aiApiKey,
          model,
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
    setSelectedModel,
  };
}

export type { ScoreAnalysisHandler };
