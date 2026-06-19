"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import { getErrorMessage } from "@/lib/errors";

interface UseJobMatchScoringStateParams {
  onScore: (input: { jobDescription: string; jobUrl: string; provider: StoredAIProvider; model: string }) => Promise<void>;
  hasAIApiKey: boolean;
}

import type { StoredAIProvider } from "@/lib/browser-preferences";

export function useJobMatchScoringState({ onScore, hasAIApiKey }: UseJobMatchScoringStateParams) {
  const t = useTranslations("analysisFlow.extraction");

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [copyPasteJobDescription, setCopyPasteJobDescription] = useState("");
  const [copyPasteJobUrl, setCopyPasteJobUrl] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);

  const handleJobMatchAnalysis = async (
    jobDescription: string,
    jobUrl: string,
    provider: StoredAIProvider,
    model: string,
  ) => {
    if (!hasAIApiKey) {
      setAiError(t("missingApiKey"));
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      await onScore({ jobDescription, jobUrl, provider, model });
    } catch (err: unknown) {
      setAiError(getErrorMessage(err));
    } finally {
      setLoadingAI(false);
    }
  };

  const openCopyPaste = (description: string, url: string | null) => {
    setCopyPasteJobDescription(description);
    setCopyPasteJobUrl(url);
    setCopyPasteOpen(true);
  };

  const closeCopyPaste = () => setCopyPasteOpen(false);

  return {
    loadingAI,
    aiError,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    handleJobMatchAnalysis,
    copyPasteOpen,
    copyPasteJobDescription,
    copyPasteJobUrl,
    openCopyPaste,
    closeCopyPaste,
  };
}
