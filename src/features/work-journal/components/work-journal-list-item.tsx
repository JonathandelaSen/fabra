"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";

interface WorkJournalListItemProps {
  entry: WorkJournalEntry;
  isSelected: boolean;
  onClick: () => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function WorkJournalListItem({
  entry,
  isSelected,
  onClick,
}: WorkJournalListItemProps) {
  const t = useTranslations("workJournal");

  // Create a preview from the final text (or raw notes if no final text)
  const previewText = entry.final_text || entry.raw_notes || "";
  const displayTopic = entry.topic || t("newEntry"); // Fallback if no topic

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative mb-2 w-full rounded-xl p-3.5 text-left border transition-all duration-200 ${
        isSelected
          ? "bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[14px] font-semibold tracking-tight text-zinc-100">
          {displayTopic}
        </p>
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
            isSelected ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
          }`}
        />
      </div>

      <div className="mt-1.5 min-w-0">
        <p className="truncate text-xs text-zinc-500 font-light">
          {previewText}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate text-[11px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
            {entry.context?.name || t("context")}
          </span>
        </div>
        <span className="shrink-0 text-[11px] text-zinc-500">
          {formatDate(entry.date_start)}
        </span>
      </div>
    </button>
  );
}
