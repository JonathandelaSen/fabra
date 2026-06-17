"use client";

import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";
import { CopyPasteDialog } from "@/components/shared/copy-paste-dialog";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import type { PrepareInterviewQuestionCopyPasteResponse } from "../api/interview-questions-api";
import { useInterviewQuestionsCopyPaste } from "../hooks/use-interview-questions-copy-paste";

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
  const {
    mode,
    setMode,
    instruction,
    setInstruction,
    preparing,
    prepared,
    error,
    handlePrepare,
  } = useInterviewQuestionsCopyPaste(questionId);

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

          <IconTextButton
            type="button"
            icon={ClipboardList}
            loading={preparing}
            tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
            onClick={handlePrepare}
            disabled={preparing || (mode === "edit" && !instruction.trim())}
            strong
          >
            {t("preparePrompt")}
          </IconTextButton>
        </div>
      ) : (
        <CopyPasteTextPanel
          title={t("panelTitle")}
          privacyNotice={prepared.privacyNotice ?? ""}
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
