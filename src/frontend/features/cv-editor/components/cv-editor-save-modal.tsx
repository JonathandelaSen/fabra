"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";

interface CVEditorSaveModalProps {
  saveName: string;
  setSaveName: (name: string) => void;
  savingAsCv: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function CVEditorSaveModal({
  saveName,
  setSaveName,
  savingAsCv,
  onClose,
  onSave,
}: CVEditorSaveModalProps) {
  const t = useTranslations("cvEditor");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim p-0 sm:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="h-full w-full sm:h-auto sm:max-w-sm rounded-none sm:rounded-3xl border-0 sm:border border-line bg-modal p-6 shadow-2xl flex flex-col justify-center"
      >
        <h3 className="text-lg font-semibold text-text-main">
          {t("saveModal.title")}
        </h3>
        <p className="mt-2 text-sm text-text-muted">
          {t("saveModal.description")}
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text-faint">
              {t("saveModal.nameLabel")}
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="h-10 w-full rounded-xl border border-line/10 bg-panel/5 px-4 text-sm text-text-main focus:border-accent-teal-border focus:outline-none"
              placeholder={t("saveModal.namePlaceholder")}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <IconTextButton
              icon={X}
              onClick={onClose}
              fullWidth
              className="min-w-0 shrink"
            >
              {t("actions.cancel")}
            </IconTextButton>
            <IconTextButton
              icon={Save}
              loading={savingAsCv}
              tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
              onClick={onSave}
              disabled={!saveName.trim() || savingAsCv}
              fullWidth
              strong
              className="min-w-0 shrink"
            >
              {t("actions.save")}
            </IconTextButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
