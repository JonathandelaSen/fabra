"use client";

import { useLocale } from "next-intl";
import { WorkJournalTimelineCard } from "./work-journal-timeline-card";
import {
  formatPeriodLabel,
  type TimelineGranularity,
  type TimelineGroup,
} from "./work-journal-timeline-utils";

interface WorkJournalTimelineGroupProps {
  group: TimelineGroup;
  granularity: TimelineGranularity;
  onSelect: (entryId: string) => void;
}

export function WorkJournalTimelineGroup({
  group,
  granularity,
  onSelect,
}: WorkJournalTimelineGroupProps) {
  const locale = useLocale();
  const label = formatPeriodLabel(group.periodStart, granularity, locale);

  return (
    <section className="relative pl-6">
      <span className="absolute left-1.5 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-action bg-panel-base" />
      <span className="absolute left-1.5 top-2 bottom-0 w-px -translate-x-1/2 bg-line" />

      <h3 className="mb-3 text-sm font-semibold capitalize tracking-tight text-text-main">
        {label}
      </h3>

      <div className="grid grid-cols-1 gap-3 pb-6 sm:grid-cols-2">
        {group.entries.map((view) => (
          <WorkJournalTimelineCard
            key={view.entry.id}
            view={view}
            onSelect={() => onSelect(view.entry.id)}
          />
        ))}
      </div>
    </section>
  );
}
