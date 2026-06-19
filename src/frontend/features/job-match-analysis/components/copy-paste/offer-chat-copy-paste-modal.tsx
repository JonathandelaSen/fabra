"use client";

import { useTranslations } from "next-intl";
import { CopyPasteDialog } from "@/frontend/components/shared/copy-paste-dialog";
import { CopyPasteTextPanel } from "@/frontend/components/shared/copy-paste-text-panel";

interface OfferChatCopyPasteModalProps {
  isOpen: boolean;
  isApplying: boolean;
  prompt: string;
  privacyNotice: string;
  onClose: () => void;
  onApplyText: (text: string) => void;
}

export function OfferChatCopyPasteModal({
  isOpen,
  isApplying,
  prompt,
  privacyNotice,
  onClose,
  onApplyText,
}: OfferChatCopyPasteModalProps) {
  const t = useTranslations("analysisDetail.chat.copyPaste");

  if (!isOpen) return null;

  return (
    <CopyPasteDialog
      title={t("title")}
      closeLabel={t("close")}
      labelledById="offer-chat-copy-paste-title"
      onClose={onClose}
    >
      <CopyPasteTextPanel
        title={t("panelTitle")}
        privacyNotice={privacyNotice}
        prompt={prompt}
        copyLabel={t("copyPrompt")}
        copiedLabel={t("promptCopied")}
        pastedTextLabel={t("pasteResponseLabel")}
        pastedTextPlaceholder={t("pasteResponsePlaceholder")}
        applyLabel={isApplying ? t("applying") : t("insertResponse")}
        emptyResponseError={t("emptyResponse")}
        onApplyText={onApplyText}
      />
    </CopyPasteDialog>
  );
}
