"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { copyToClipboard } from "@/frontend/utils/clipboard";

type Step = "copy" | "paste" | "review";

interface PrepareResult {
  prompt: string;
  privacyNotice?: string | null;
}

interface UseCopyPasteWorkflowStateOptions<TPrepare extends PrepareResult, TPreview> {
  open: boolean;
  prepare: () => Promise<TPrepare>;
  preview: (rawResponse: string, prepareData: TPrepare) => Promise<TPreview>;
  apply: (previewData: TPreview, prepareData: TPrepare) => Promise<unknown>;
  getCorrectionInstructions: () => string;
  onApplied: (result: unknown) => void;
  onClose: () => void;
}

export function useCopyPasteWorkflowState<
  TPrepare extends PrepareResult,
  TPreview,
>(options: UseCopyPasteWorkflowStateOptions<TPrepare, TPreview>) {
  const { open, prepare, preview, apply, getCorrectionInstructions, onApplied, onClose } =
    options;

  const [step, setStep] = useState<Step>("copy");
  const [prepareData, setPrepareData] = useState<TPrepare | null>(null);
  const [rawResponse, setRawResponse] = useState("");
  const [previewData, setPreviewData] = useState<TPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCorrection, setCopiedCorrection] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("copy");
    setPrepareData(null);
    setRawResponse("");
    setPreviewData(null);
    setError(null);
    setIsPreparing(true);
    prepare()
      .then((data) => setPrepareData(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsPreparing(false));
  }, [open]);

  const copyPrompt = useCallback(async () => {
    if (!prepareData) return;
    await copyToClipboard(prepareData.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  }, [prepareData]);

  const copyCorrection = useCallback(async () => {
    await copyToClipboard(getCorrectionInstructions());
    setCopiedCorrection(true);
    setTimeout(() => setCopiedCorrection(false), 1800);
  }, [getCorrectionInstructions]);

  const validateResponse = useCallback(async () => {
    setIsPreviewing(true);
    setError(null);
    try {
      if (!prepareData) return;
      const data = await preview(rawResponse, prepareData);
      setPreviewData(data);
      setStep("review");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPreviewing(false);
    }
  }, [preview, prepareData, rawResponse]);

  const applyResult = useCallback(async () => {
    if (!previewData || !prepareData) return;
    setIsApplying(true);
    setError(null);
    try {
      const result = await apply(previewData, prepareData);
      onApplied(result);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsApplying(false);
    }
  }, [apply, prepareData, previewData, onApplied, onClose]);

  return {
    step,
    setStep,
    prepareData,
    rawResponse,
    setRawResponse,
    previewData,
    error,
    isPreparing,
    isPreviewing,
    isApplying,
    copiedPrompt,
    copiedCorrection,
    copyPrompt,
    copyCorrection,
    validateResponse,
    applyResult,
    prompt: prepareData?.prompt ?? "",
    privacyNotice: prepareData?.privacyNotice ?? "",
  };
}
