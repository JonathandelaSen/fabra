"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0a12] p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-white">
          {t("saveModal.title")}
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          {t("saveModal.description")}
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              {t("saveModal.nameLabel")}
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-teal-500/50 focus:outline-none"
              placeholder={t("saveModal.namePlaceholder")}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-zinc-400 hover:bg-white/5"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              onClick={onSave}
              disabled={!saveName.trim() || savingAsCv}
              className="flex-1 bg-teal-500 text-black hover:bg-teal-400"
            >
              {savingAsCv ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("actions.save")
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
