"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errors";

type Step = "copy" | "paste" | "review";

interface PrepareResult {
  prompt: string;
  privacyNotice: string;
}

interface UseCopyPasteWorkflowStateOptions<TPrepare extends PrepareResult, TPreview> {
  open: boolean;
  prepare: () => Promise<TPrepare>;
  preview: (rawResponse: string) => Promise<TPreview>;
  apply: (previewData: TPreview) => Promise<unknown>;
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
    await navigator.clipboard.writeText(prepareData.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  }, [prepareData]);

  const copyCorrection = useCallback(async () => {
    await navigator.clipboard.writeText(getCorrectionInstructions());
    setCopiedCorrection(true);
    setTimeout(() => setCopiedCorrection(false), 1800);
  }, [getCorrectionInstructions]);

  const validateResponse = useCallback(async () => {
    setIsPreviewing(true);
    setError(null);
    try {
      const data = await preview(rawResponse);
      setPreviewData(data);
      setStep("review");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPreviewing(false);
    }
  }, [preview, rawResponse]);

  const applyResult = useCallback(async () => {
    if (!previewData) return;
    setIsApplying(true);
    setError(null);
    try {
      const result = await apply(previewData);
      onApplied(result);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsApplying(false);
    }
  }, [apply, previewData, onApplied, onClose]);

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
