"use client";

import { useTranslations } from "next-intl";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";
import { CopyPasteDialog } from "@/components/shared/copy-paste-dialog";
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
    <CopyPasteDialog
      title={t("title")}
      closeLabel={t("close")}
      labelledById="feedback-copy-paste-title"
      onClose={onClose}
    >
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
    </CopyPasteDialog>
  );
}

