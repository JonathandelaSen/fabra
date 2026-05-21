"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { FeedbackListItem } from "../api/feedback-notes-api";

interface FeedbackNoteListItemProps {
  feedback: FeedbackListItem;
  isSelected: boolean;
  onSelect: () => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function FeedbackNoteListItem({
  feedback,
  isSelected,
  onSelect,
}: FeedbackNoteListItemProps) {
  const t = useTranslations("feedbackNotes");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative mb-2 w-full rounded-xl p-3.5 text-left border transition-all duration-200 ${
        isSelected
          ? "bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
      }`}
    >
      {/* Premium left indicator stripe when selected */}
      {isSelected && (
        <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-md bg-indigo-500 transition-all duration-200" />
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[14px] font-semibold tracking-tight text-zinc-100">
          {feedback.personName}
        </p>
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
            isSelected ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
          }`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {feedback.status === "closed" && (
            <span className="shrink-0 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-rose-400">
              {t("status.closed")}
            </span>
          )}
          <span className="truncate text-[11px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
            {feedback.activityContextName}
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-zinc-600 font-mono">
          {formatDate(feedback.updatedAt)}
        </span>
      </div>
    </button>
  );
}
