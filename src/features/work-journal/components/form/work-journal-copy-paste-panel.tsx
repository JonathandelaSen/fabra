"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";
import { CopyPasteDialog } from "@/components/shared/copy-paste-dialog";
import { buildWorkJournalEntryDraftClipboardPrompt } from "../../api/work-journal-prompt";
import type {
  WorkJournalContextLegacy as WorkJournalContext,
} from "../../api/work-journal-types";

interface WorkJournalCopyPastePanelProps {
  context: WorkJournalContext | null;
  dateStart: string;
  dateEnd: string | null;
  topic: string | null;
  notes: string;
  onPasteText: (finalText: string) => void;
  onClose: () => void;
}

export function WorkJournalCopyPastePanel({
  context,
  dateStart,
  dateEnd,
  topic,
  notes,
  onPasteText,
  onClose,
}: WorkJournalCopyPastePanelProps) {
  const t = useTranslations("workJournal.copyPaste");

  const prompt = useMemo(() => {
    if (!context || !notes.trim()) return "";
    return buildWorkJournalEntryDraftClipboardPrompt({
      context: {
        type: context.type,
        name: context.name,
        roleOrLabel: context.role_or_label,
      },
      dateStart,
      dateEnd,
      topic,
      notes,
    });
  }, [context, dateEnd, dateStart, notes, topic]);

  return (
    <CopyPasteDialog
      title={t("title")}
      closeLabel={t("close")}
      labelledById="work-journal-copy-paste-title"
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
        onApplyText={(finalText) => {
          onPasteText(finalText);
          onClose();
        }}
      />
    </CopyPasteDialog>
  );
}

