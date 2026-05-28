"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("receivedFeedback");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-xl p-3.5 text-left border transition-all duration-200 ${
        isSelected
          ? "bg-panel-selected border-action-border text-text-main shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-text-muted hover:bg-panel-row-hover hover:border-line hover:text-text-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold text-text-main">
          {item.giverName}
        </p>
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
            isSelected
              ? "text-action-text"
              : "text-text-faint group-hover:text-text-muted"
          }`}
        />
      </div>

      <p className="mt-1.5 line-clamp-2 text-xs text-text-muted leading-relaxed group-hover:text-text-muted">
        {item.feedbackText}
      </p>

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium text-text-muted bg-panel-subtle border border-line rounded px-1.5 py-0.5">
          {contextName || t("labels.general")}
        </span>
        <span className="shrink-0 text-[10px] text-text-muted">
          {formatDate(item.receivedDate)}
        </span>
      </div>
    </button>
  );
}
