"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[min(760px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-panel-elevated p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="absolute right-4 top-4 rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
            >
              <X className="size-4" />
            </button>
            <div className="mb-4 pr-8">
              <h3 className="text-base font-semibold text-zinc-100">
                {t("title")}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{t("intro")}</p>
            </div>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
