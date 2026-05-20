"use client";

import { useEffect, useState } from "react";
import { Check, Clipboard, Copy, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import type { CVAnalysisDetailResponse } from "@/app/api/cv-analyses/responses";
import type {
  CVAnalysisCopyPasteResult,
  PreviewCVAnalysisCopyPasteResponse,
} from "@/app/api/cv-analyses/[id]/score/copy-paste/preview/responses";
import {
  applyCVAnalysisCopyPaste,
  prepareCVAnalysisCopyPaste,
  previewCVAnalysisCopyPaste,
} from "../api/cv-analysis-copy-paste-api";

type Step = "copy" | "paste" | "review";

interface CVScoreCopyPasteModalProps {
  analysisId: string;
  additionalContext: string | null;
  open: boolean;
  onClose: () => void;
  onApplied: (analysis: CVAnalysisDetailResponse) => void;
}

const correctionInstructions =
  "Please return only the required JSON envelope. Do not include Markdown or explanation outside JSON. Keep workflowId as cv_analysis.score and schemaVersion as 1.";

export default function CVScoreCopyPasteModal({
  analysisId,
  additionalContext,
  open,
  onClose,
  onApplied,
}: CVScoreCopyPasteModalProps) {
  const t = useTranslations("analysisFlow.copyPaste");
  const [step, setStep] = useState<Step>("copy");
  const [prompt, setPrompt] = useState("");
  const [privacyNotice, setPrivacyNotice] = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [preview, setPreview] =
    useState<PreviewCVAnalysisCopyPasteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCorrection, setCopiedCorrection] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("copy");
    setPrompt("");
    setPrivacyNotice("");
    setRawResponse("");
    setPreview(null);
    setError(null);
    setLoading(true);
    prepareCVAnalysisCopyPaste(analysisId, { additionalContext })
      .then((data) => {
        setPrompt(data.prompt);
        setPrivacyNotice(data.privacyNotice);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [analysisId, additionalContext, open]);

  if (!open) return null;

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  };

  const copyCorrection = async () => {
    await navigator.clipboard.writeText(correctionInstructions);
    setCopiedCorrection(true);
    setTimeout(() => setCopiedCorrection(false), 1800);
  };

  const validateResponse = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await previewCVAnalysisCopyPaste(analysisId, { rawResponse });
      setPreview(data);
      setStep("review");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await applyCVAnalysisCopyPaste(analysisId, {
        parsedResult: preview.parsedResult as CVAnalysisCopyPasteResult,
      });
      onApplied(updated);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{t("title")}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t("intro")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-white/10 px-5 py-3 text-xs text-zinc-500">
          <span className={step === "copy" ? "text-indigo-300" : ""}>
            {t("stepCopy")}
          </span>
          <span>/</span>
          <span className={step === "paste" ? "text-indigo-300" : ""}>
            {t("stepPaste")}
          </span>
          <span>/</span>
          <span className={step === "review" ? "text-indigo-300" : ""}>
            {t("stepReview")}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {privacyNotice && (
            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {t("privacyNotice")}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <p>{error}</p>
              {step === "paste" && (
                <button
                  type="button"
                  onClick={copyCorrection}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-rose-300"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedCorrection
                    ? t("correctionCopied")
                    : t("copyCorrection")}
                </button>
              )}
            </div>
          )}

          {step === "copy" && (
            <div className="space-y-4">
              <textarea
                readOnly
                value={loading ? t("preparing") : prompt}
                className="h-80 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-zinc-300 focus:outline-none"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={copyPrompt}
                  disabled={!prompt || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
                >
                  {copiedPrompt ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copiedPrompt ? t("promptCopied") : t("copyPrompt")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("paste")}
                  disabled={!prompt || loading}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                >
                  {t("continue")}
                </button>
              </div>
            </div>
          )}

          {step === "paste" && (
            <div className="space-y-4">
              <label
                htmlFor="cv-copy-paste-response"
                className="block text-sm font-medium text-zinc-300"
              >
                {t("pasteResponseLabel")}
              </label>
              <textarea
                id="cv-copy-paste-response"
                value={rawResponse}
                onChange={(event) => setRawResponse(event.target.value)}
                className="h-72 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-zinc-300 focus:border-indigo-500/50 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={validateResponse}
                  disabled={loading || !rawResponse.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("validateResponse")}
                </button>
              </div>
            </div>
          )}

          {step === "review" && preview && (
            <div className="space-y-4">
              {preview.preview.willReplaceExistingResult && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {t("replacementWarning")}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <PreviewItem label={t("scoreLabel")} value={`${preview.preview.score}/100`} />
                <PreviewItem label={t("originLabel")} value={t("externalChat")} />
                <PreviewItem label={t("strengthsCount")} value={preview.preview.strengthsCount} />
                <PreviewItem label={t("improvementAreasCount")} value={preview.preview.improvementAreasCount} />
                <PreviewItem label={t("recommendationsCount")} value={preview.preview.recommendationsCount} />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
                  {t("summaryLabel")}
                </p>
                <p className="text-sm text-zinc-200">{preview.preview.summary}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          >
            {t("cancel")}
          </button>
          {step === "review" && preview && (
            <button
              type="button"
              onClick={apply}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {preview.preview.willReplaceExistingResult
                ? t("replaceAnalysis")
                : t("applyAnalysis")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
