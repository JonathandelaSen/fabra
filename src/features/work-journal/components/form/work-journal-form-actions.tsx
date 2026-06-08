"use client";

import { useTranslations } from "next-intl";
import { Save } from "lucide-react";

interface WorkJournalFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
}

export function WorkJournalFormActions({
  onSave,
  onCancel,
}: WorkJournalFormActionsProps) {
  const t = useTranslations("workJournal");
  const common = useTranslations("common.actions");

  return (
    <div className="flex items-center gap-4 pt-6">
      <button
        type="button"
        onClick={onSave}
        className="px-6 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {t("saveEntry")}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {common("cancel")}
      </button>
    </div>
  );
}
