"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";
import {
  prepareInterviewQuestionCopyPaste,
  type PrepareInterviewQuestionCopyPasteResult,
} from "../api/interview-questions-api";

interface InterviewQuestionCopyPastePanelProps {
  questionId: string;
  hasAnswer: boolean;
  onPasteAnswer: (answer: string) => void;
  onClose: () => void;
}

export function InterviewQuestionCopyPastePanel({
  questionId,
  hasAnswer,
  onPasteAnswer,
  onClose,
}: InterviewQuestionCopyPastePanelProps) {
  const t = useTranslations("interviewQuestions.copyPaste");
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const [instruction, setInstruction] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [prepared, setPrepared] =
    useState<PrepareInterviewQuestionCopyPasteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePrepare = async () => {
    setPreparing(true);
    setError(null);
    try {
      const result = await prepareInterviewQuestionCopyPaste({
        id: questionId,
        input: {
          mode,
          instruction: mode === "edit" ? instruction : undefined,
        },
      });
      setPrepared(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("prepareError"));
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-question-copy-paste-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2
            id="interview-question-copy-paste-title"
            className="text-lg font-semibold text-zinc-100"
          >
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {!prepared ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("generate")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mode === "generate"
                      ? "bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-white/[0.06]"
                  }`}
                >
                  {t("modeGenerate")}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  disabled={!hasAnswer}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                    mode === "edit"
                      ? "bg-teal-500/20 text-teal-200 border border-teal-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-white/[0.06]"
                  }`}
                >
                  {t("modeEdit")}
                </button>
              </div>

              {mode === "edit" && (
                <div>
                  <label
                    htmlFor="copy-paste-instruction"
                    className="mb-1 block text-xs font-medium text-zinc-400"
                  >
                    {t("instructionLabel")}
                  </label>
                  <input
                    id="copy-paste-instruction"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder={t("instructionPlaceholder")}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-300"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-rose-300">{error}</p>
              )}

              <button
                type="button"
                onClick={handlePrepare}
                disabled={preparing || (mode === "edit" && !instruction.trim())}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
              >
                {preparing && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("preparePrompt")}
              </button>
            </div>
          ) : (
            <CopyPasteTextPanel
              title={t("panelTitle")}
              privacyNotice={prepared.privacyNotice}
              prompt={prepared.prompt}
              copyLabel={t("copyPrompt")}
              copiedLabel={t("promptCopied")}
              pastedTextLabel={t("pasteResponseLabel")}
              pastedTextPlaceholder={t("pasteResponsePlaceholder")}
              applyLabel={t("usePastedText")}
              emptyResponseError={t("emptyResponse")}
              onApplyText={(answer) => {
                onPasteAnswer(answer);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
