"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";
import { CopyPasteDialog } from "@/components/shared/copy-paste-dialog";
import { Button } from "@/components/ui/button";
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
    <CopyPasteDialog
      title={t("title")}
      closeLabel={t("close")}
      labelledById="interview-question-copy-paste-title"
      onClose={onClose}
    >
      {!prepared ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("generate")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                mode === "generate"
                  ? "bg-indigo-600/20 text-indigo-200 border-indigo-500/30"
                  : "bg-zinc-850 text-zinc-450 border border-white/[0.04] hover:bg-zinc-800"
              }`}
            >
              {t("modeGenerate")}
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              disabled={!hasAnswer}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                mode === "edit"
                  ? "bg-indigo-600/20 text-indigo-200 border-indigo-500/30"
                  : "bg-zinc-850 text-zinc-450 border border-white/[0.04] hover:bg-zinc-800"
              }`}
            >
              {t("modeEdit")}
            </button>
          </div>

          {mode === "edit" && (
            <div>
              <label
                htmlFor="copy-paste-instruction"
                className="mb-1 block text-xs font-medium text-zinc-450"
              >
                {t("instructionLabel")}
              </label>
              <input
                id="copy-paste-instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={t("instructionPlaceholder")}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-300">{error}</p>
          )}

          <Button
            type="button"
            onClick={handlePrepare}
            disabled={preparing || (mode === "edit" && !instruction.trim())}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/10"
          >
            {preparing && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("preparePrompt")}
          </Button>
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
    </CopyPasteDialog>
  );
}

