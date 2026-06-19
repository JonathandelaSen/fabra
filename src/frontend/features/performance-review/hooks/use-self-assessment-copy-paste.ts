"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { SelfAssessmentCopyPasteResponse } from "../api/performance-review-api";

type Step = "copy" | "paste" | "review";

export interface SelfAssessmentPreview {
  content: string;
}

interface UseSelfAssessmentCopyPasteParams {
  onPrepare: () => Promise<SelfAssessmentCopyPasteResponse>;
  onApply: (envelope: unknown) => Promise<unknown>;
  onClose: () => void;
}

export function useSelfAssessmentCopyPaste({
  onPrepare,
  onApply,
  onClose,
}: UseSelfAssessmentCopyPasteParams) {
  const t = useTranslations("performanceReview.copyPaste");
  const [step, setStep] = useState<Step>("copy");
  const [isPreparing, setIsPreparing] = useState(true);
  const [prepared, setPrepared] =
    useState<SelfAssessmentCopyPasteResponse | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const [previewData, setPreviewData] = useState<SelfAssessmentPreview | null>(
    null,
  );
  const [parsedEnvelope, setParsedEnvelope] = useState<unknown>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCorrection, setCopiedCorrection] = useState(false);
  const onPrepareRef = useRef(onPrepare);

  useEffect(() => {
    onPrepareRef.current()
      .then(setPrepared)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t("prepareError")),
      )
      .finally(() => setIsPreparing(false));
  }, [t]);

  const copyPrompt = useCallback(() => {
    if (!prepared) return;
    void navigator.clipboard.writeText(prepared.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }, [prepared]);

  const copyCorrection = useCallback(() => {
    void navigator.clipboard.writeText(t("correctionPrompt"));
    setCopiedCorrection(true);
    setTimeout(() => setCopiedCorrection(false), 2000);
  }, [t]);

  const validateResponse = useCallback(() => {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      setError(t("invalidJson"));
      return;
    }
    const envelope = parsed as {
      workflowId?: unknown;
      schemaVersion?: unknown;
      result?: { content?: unknown };
    };
    const content = envelope.result?.content;
    if (
      envelope.workflowId !== prepared?.workflowId ||
      envelope.schemaVersion !== prepared?.schemaVersion ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      setError(t("invalidEnvelope"));
      return;
    }
    setParsedEnvelope(parsed);
    setPreviewData({ content });
    setStep("review");
  }, [rawResponse, prepared, t]);

  const applyResult = useCallback(async () => {
    if (!parsedEnvelope) return;
    setIsApplying(true);
    setError(null);
    try {
      await onApply(parsedEnvelope);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("applyError"));
    } finally {
      setIsApplying(false);
    }
  }, [parsedEnvelope, onApply, onClose, t]);

  return {
    step,
    setStep,
    isPreparing,
    prompt: prepared?.prompt ?? "",
    privacyNotice: prepared?.privacyNotice ?? "",
    copiedPrompt,
    copyPrompt,
    rawResponse,
    setRawResponse,
    isPreviewing: false,
    validateResponse,
    previewData,
    isApplying,
    applyResult,
    error,
    copiedCorrection,
    copyCorrection,
  };
}
