"use client";

import { ChevronRight } from "lucide-react";
import type { ReceivedFeedbackItem } from "../api/received-feedback-api";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ReceivedFeedbackListItemProps {
  item: ReceivedFeedbackItem;
  isSelected: boolean;
  contextName: string | undefined;
  onClick: () => void;
}

export function ReceivedFeedbackListItem({
  item,
  isSelected,
  contextName,
  onClick,
}: ReceivedFeedbackListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-xl p-3.5 text-left border transition-all duration-200 ${
        isSelected
          ? "bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold text-zinc-100">
          {item.giverName}
        </p>
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
            isSelected
              ? "text-indigo-400"
              : "text-zinc-600 group-hover:text-zinc-400"
          }`}
        />
      </div>

      <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400">
        {item.feedbackText}
      </p>

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
          {contextName || "General"}
        </span>
        <span className="shrink-0 text-[10px] text-zinc-500">
          {formatDate(item.receivedDate)}
        </span>
      </div>
    </button>
  );
}
