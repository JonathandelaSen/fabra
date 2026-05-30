"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_FAST_GEMINI_MODEL, DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { getErrorMessage } from "@/lib/errors";

interface UseJobMatchScoringStateParams {
  onScore: (input: { jobDescription: string; jobUrl: string; model: string }) => Promise<void>;
  hasAIApiKey: boolean;
}

export function useJobMatchScoringState({ onScore, hasAIApiKey }: UseJobMatchScoringStateParams) {
  const t = useTranslations("analysisFlow.extraction");
  const formsT = useTranslations("analysisFlow.forms");

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [copyPasteJobDescription, setCopyPasteJobDescription] = useState("");
  const [copyPasteJobUrl, setCopyPasteJobUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_FAST_GEMINI_MODEL);

  const models = [
    { id: DEFAULT_FAST_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_FAST_GEMINI_MODEL]} (${formsT("fast")})` },
    { id: DEFAULT_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_GEMINI_MODEL]} (${formsT("powerful")})` },
  ];

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
      await onScore({ jobDescription, jobUrl, model });
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
    selectedModel,
    models,
    setSelectedModel,
    handleJobMatchAnalysis,
    copyPasteOpen,
    copyPasteJobDescription,
    copyPasteJobUrl,
    openCopyPaste,
    closeCopyPaste,
  };
}
