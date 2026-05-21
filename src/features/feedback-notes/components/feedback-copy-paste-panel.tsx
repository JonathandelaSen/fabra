"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";
import {
  buildFeedbackNotesFinalPrompt,
  type FeedbackEntry,
  type FeedbackListItem,
} from "../api/feedback-notes-api";

interface FeedbackCopyPastePanelProps {
  feedback: FeedbackListItem;
  entries: FeedbackEntry[];
  onApplyText: (text: string) => void;
  onClose: () => void;
}

export function FeedbackCopyPastePanel({
  feedback,
  entries,
  onApplyText,
  onClose,
}: FeedbackCopyPastePanelProps) {
  const t = useTranslations("feedbackNotes.copyPaste");

  const prompt = buildFeedbackNotesFinalPrompt({
    personName: feedback.personName,
    entries: entries.map((entry) => ({
      content: entry.content,
      createdAt: entry.createdAt,
    })),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-copy-paste-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2
            id="feedback-copy-paste-title"
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
          <CopyPasteTextPanel
            title={t("panelTitle")}
            privacyNotice={t("privacyNotice")}
            prompt={prompt}
            copyLabel={t("copyPrompt")}
            copiedLabel={t("promptCopied")}
            pastedTextLabel={t("pasteResponseLabel")}
            pastedTextPlaceholder={t("pasteResponsePlaceholder")}
            applyLabel={t("usePastedText")}
            emptyResponseError={t("emptyResponse")}
            onApplyText={(text) => {
              onApplyText(text);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
