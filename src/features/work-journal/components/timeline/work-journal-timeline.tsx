"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarRange } from "lucide-react";
import type { WorkJournalEntry } from "../../api/work-journal-types";
import { WorkJournalEmptyState } from "../work-journal-empty-state";
import { WorkJournalSidebarSkeleton } from "../work-journal-skeleton";
import { WorkJournalTimelineGroup } from "./work-journal-timeline-group";
import { WorkJournalTimelineGranularityToggle } from "./work-journal-timeline-granularity-toggle";
import {
  groupEntriesByPeriod,
  type TimelineGranularity,
} from "./work-journal-timeline-utils";

interface WorkJournalTimelineProps {
  entries: WorkJournalEntry[];
  isLoading: boolean;
  isFiltered: boolean;
  granularity: TimelineGranularity;
  setGranularity: (granularity: TimelineGranularity) => void;
  onSelect: (entryId: string) => void;
  onCreate?: () => void;
}

export function WorkJournalTimeline({
  entries,
  isLoading,
  isFiltered,
  granularity,
  setGranularity,
  onSelect,
  onCreate,
}: WorkJournalTimelineProps) {
  const t = useTranslations("workJournal");
  const locale = useLocale();

  const groups = useMemo(
    () => groupEntriesByPeriod(entries, granularity, locale),
    [entries, granularity, locale],
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-end">
        <WorkJournalTimelineGranularityToggle
          granularity={granularity}
          onChange={setGranularity}
        />
      </div>

      {isLoading ? (
        <WorkJournalSidebarSkeleton />
      ) : groups.length === 0 ? (
        <WorkJournalEmptyState
          icon={CalendarRange}
          text={isFiltered ? t("empty") : t("timeline.empty")}
          actionLabel={t("newEntry")}
          onCreate={onCreate}
        />
      ) : (
        <div className="flex flex-col">
          {groups.map((group) => (
            <WorkJournalTimelineGroup
              key={group.key}
              group={group}
              granularity={granularity}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
