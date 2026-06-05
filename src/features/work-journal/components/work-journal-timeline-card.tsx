"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { LabelBadge } from "@/components/shared/label-badge";
import type { TimelineEntryView } from "./work-journal-timeline-utils";
import { getContextTone } from "./work-journal-timeline-utils";

interface WorkJournalTimelineCardProps {
  view: TimelineEntryView;
  onSelect: () => void;
}

export function WorkJournalTimelineCard({
  view,
  onSelect,
}: WorkJournalTimelineCardProps) {
  const t = useTranslations("workJournal");
  const { entry, rangeLabel, continuesAfter } = view;

  const displayTopic = entry.topic || t("newEntry");
  const previewText = entry.final_text || entry.raw_notes || "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full flex-col gap-2 rounded-xl border border-line bg-panel-subtle p-4 text-left transition-colors hover:border-ring/40 hover:bg-panel-hover/50"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-text-muted">
          {rangeLabel}
        </span>
        {continuesAfter && (
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-text-faint">
            {t("timeline.continues")}
            <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>

      <p className="truncate text-[14px] font-semibold tracking-tight text-text-main transition-colors group-hover:text-action-text">
        {displayTopic}
      </p>

      {previewText && (
        <p className="line-clamp-2 text-xs font-light text-text-muted">
          {previewText}
        </p>
      )}

      <div className="mt-1 flex min-w-0">
        <LabelBadge size="xs" tone={getContextTone(entry.context_id)}>
          {entry.context?.name || t("context")}
        </LabelBadge>
      </div>
    </button>
  );
}
