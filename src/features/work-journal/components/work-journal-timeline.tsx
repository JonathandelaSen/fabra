"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarRange, Search } from "lucide-react";
import type {
  WorkJournalEntryLegacy as WorkJournalEntry,
  WorkJournalContextLegacy as WorkJournalContext,
} from "../api/work-journal-types";
import { WorkJournalEmptyState } from "./work-journal-empty-state";
import { WorkJournalSidebarSkeleton } from "./work-journal-skeleton";
import { WorkJournalTimelineGroup } from "./work-journal-timeline-group";
import { WorkJournalTimelineGranularityToggle } from "./work-journal-timeline-granularity-toggle";
import {
  groupEntriesByPeriod,
  type TimelineGranularity,
} from "./work-journal-timeline-utils";

interface WorkJournalTimelineProps {
  entries: WorkJournalEntry[];
  contexts: WorkJournalContext[];
  isLoading: boolean;
  search: string;
  setSearch: (value: string) => void;
  contextFilter: string;
  setContextFilter: (value: string) => void;
  granularity: TimelineGranularity;
  setGranularity: (granularity: TimelineGranularity) => void;
  onSelect: (entryId: string) => void;
}

export function WorkJournalTimeline({
  entries,
  contexts,
  isLoading,
  search,
  setSearch,
  contextFilter,
  setContextFilter,
  granularity,
  setGranularity,
  onSelect,
}: WorkJournalTimelineProps) {
  const t = useTranslations("workJournal");
  const locale = useLocale();
  const activeContexts = contexts.filter((context) => context.status === "active");

  const groups = useMemo(
    () => groupEntriesByPeriod(entries, granularity, locale),
    [entries, granularity, locale],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <label className="relative block w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-field py-1.5 pl-9 pr-3 text-xs text-text-main outline-none placeholder:text-text-faint focus:border-ring/40 transition-colors"
            />
          </label>
          <select
            className="h-9 max-w-xs rounded-lg border border-line bg-panel-elevated px-3 py-1.5 text-xs text-text-muted outline-none focus:border-ring/40 focus:text-text-main transition-colors cursor-pointer appearance-none"
            value={contextFilter}
            onChange={(event) => setContextFilter(event.target.value)}
          >
            <option value="">{t("allContexts")}</option>
            {activeContexts.map((context) => (
              <option key={`timeline-filter-${context.id}`} value={context.id}>
                {context.name}
              </option>
            ))}
          </select>
        </div>
        <WorkJournalTimelineGranularityToggle
          granularity={granularity}
          onChange={setGranularity}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <WorkJournalSidebarSkeleton />
        ) : groups.length === 0 ? (
          <WorkJournalEmptyState
            icon={CalendarRange}
            text={search || contextFilter ? t("empty") : t("timeline.empty")}
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
    </div>
  );
}
