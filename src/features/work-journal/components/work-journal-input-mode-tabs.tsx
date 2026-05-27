"use client";

import { useTranslations } from "next-intl";
import type { WorkJournalEntryInputMode } from "../api/work-journal-types";

const modes: WorkJournalEntryInputMode[] = ["manual", "ai_assisted"];

interface WorkJournalInputModeTabsProps {
  value: WorkJournalEntryInputMode;
  onChange: (mode: WorkJournalEntryInputMode) => void;
}

export function WorkJournalInputModeTabs({
  value,
  onChange,
}: WorkJournalInputModeTabsProps) {
  const t = useTranslations("workJournal");

  return (
    <div className="flex gap-4 mb-2">
      {modes.map((mode) => (
        <button
          key={`mode-${mode}`}
          type="button"
          onClick={() => onChange(mode)}
          className={`text-sm font-medium transition-colors pb-1 border-b-2 ${
            value === mode
              ? "text-zinc-100 border-zinc-100"
              : "text-zinc-600 border-transparent hover:text-zinc-400"
          }`}
        >
          {mode === "manual" ? t("freeWriting") : t("aiWriting")}
        </button>
      ))}
    </div>
  );
}
