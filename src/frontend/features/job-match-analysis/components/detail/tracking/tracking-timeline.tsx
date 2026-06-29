"use client";

import { useTranslations } from "next-intl";
import type { JobMatchAnalysisTrackingEntryResponse } from "@/app/api/job-match-analyses/responses";
import { TrackingEntryCard } from "./tracking-entry-card";

interface TrackingTimelineProps {
  entries: JobMatchAnalysisTrackingEntryResponse[];
  onEdit: (entry: JobMatchAnalysisTrackingEntryResponse) => void;
  onDelete: (entry: JobMatchAnalysisTrackingEntryResponse) => void;
}

export function TrackingTimeline({
  entries,
  onEdit,
  onDelete,
}: TrackingTimelineProps) {
  const t = useTranslations("analysisDetail.tracking");

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-text-muted">
        {t("empty")}
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 before:absolute before:inset-y-3 before:left-[7px] before:w-px before:bg-line sm:before:left-[9px]">
      {entries.map((entry) => (
        <li key={entry.id} className="relative pl-7 sm:pl-9">
          <span className="absolute left-0 top-5 size-[15px] rounded-full border-[3px] border-panel-base bg-action sm:size-[19px]" />
          <TrackingEntryCard
            entry={entry}
            onEdit={() => onEdit(entry)}
            onDelete={() => onDelete(entry)}
          />
        </li>
      ))}
    </ol>
  );
}
