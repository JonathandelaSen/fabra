"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertTriangle, Globe2, X } from "lucide-react";
import { AlertBanner, ALERT_BANNER_TONES } from "@/frontend/components/shared/alert-banner";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";

interface CVEditorPublicModalProps {
  publicDraftUrl: string | null;
  normalizedPublicSlug: string;
  savingPublicSettings: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CVEditorPublicModal({
  publicDraftUrl,
  normalizedPublicSlug,
  savingPublicSettings,
  onClose,
  onConfirm,
}: CVEditorPublicModalProps) {
  const t = useTranslations("cvEditor");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim p-0 sm:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="h-full w-full sm:h-auto sm:max-w-md overflow-hidden rounded-none sm:rounded-3xl border-0 sm:border border-danger-border bg-modal p-6 shadow-2xl flex flex-col justify-center"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger-text">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-text-main">
          {t("publicModal.title")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {t("publicModal.description")}
        </p>
        <AlertBanner tone={ALERT_BANNER_TONES.DANGER} className="mt-4">
          {t("publicModal.warning")}
        </AlertBanner>
        <div className="mt-6 rounded-xl border border-line bg-panel-hover px-3 py-2 text-xs text-text-soft">
          {publicDraftUrl || `/cv/id/${normalizedPublicSlug}`}
        </div>
        <div className="mt-6 flex min-w-0 gap-3">
          <IconTextButton
            icon={X}
            onClick={onClose}
            fullWidth
            className="min-w-0 shrink"
          >
            {t("actions.cancel")}
          </IconTextButton>
          <IconTextButton
            icon={Globe2}
            tone={ICON_TEXT_BUTTON_TONES.DANGER}
            disabled={savingPublicSettings || !normalizedPublicSlug}
            loading={savingPublicSettings}
            onClick={onConfirm}
            fullWidth
            strong
            className="min-w-0 shrink"
          >
            {t("publicModal.confirm")}
          </IconTextButton>
        </div>
      </motion.div>
    </div>
  );
}
