"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-[#0a0a12] p-6 shadow-2xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          {t("publicModal.title")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {t("publicModal.description")}
        </p>
        <div className="mt-4 rounded-2xl border border-rose-500/15 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200">
          {t("publicModal.warning")}
        </div>
        <div className="mt-6 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-300">
          {publicDraftUrl || `/cv/id/${normalizedPublicSlug}`}
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-zinc-400 hover:bg-white/5"
          >
            {t("actions.cancel")}
          </Button>
          <Button
            disabled={savingPublicSettings || !normalizedPublicSlug}
            onClick={onConfirm}
            className="flex-1 bg-rose-500 text-white hover:bg-rose-400"
          >
            {savingPublicSettings ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("publicModal.confirm")
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
