"use client";

import { useTranslations } from "next-intl";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import type {
  WorkJournalEntryLegacy as WorkJournalEntry,
  WorkJournalContextLegacy as WorkJournalContext,
} from "../../api/work-journal-types";
import { WorkJournalSidebarSkeleton } from "../work-journal-skeleton";
import { WorkJournalListItem } from "./work-journal-list-item";


interface WorkJournalSidebarProps {
  entries: WorkJournalEntry[];
  contexts: WorkJournalContext[];
  selectedId: string | null;
  isLoading: boolean;
  search: string;
  setSearch: (s: string) => void;
  contextFilter: string;
  setContextFilter: (s: string) => void;
  onSelect: (entryId: string) => void;
}

export function WorkJournalSidebar({
  entries,
  contexts,
  selectedId,
  isLoading,
  search,
  setSearch,
  contextFilter,
  setContextFilter,
  onSelect,
}: WorkJournalSidebarProps) {
  const t = useTranslations("workJournal");
  const activeContexts = contexts.filter((context) => context.status === "active");

  return (
    <FeatureSidebarPanel
      header={
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-line bg-field px-3 py-1.5 text-xs text-text-main outline-none placeholder:text-text-faint focus:border-ring/40 transition-colors"
          />
          <select
            className="h-9 w-full rounded-lg border border-line bg-panel-elevated px-3 py-1.5 text-xs text-text-muted outline-none focus:border-ring/40 focus:text-text-main transition-colors cursor-pointer appearance-none"
            value={contextFilter}
            onChange={(e) => setContextFilter(e.target.value)}
          >
            <option value="">{t("allContexts")}</option>
            {activeContexts.map((context) => (
              <option key={`filter-${context.id}`} value={context.id}>
                {context.name}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {isLoading ? (
        <WorkJournalSidebarSkeleton />
      ) : entries.length === 0 ? (
        <div className="px-4 py-12 text-center text-xs text-text-faint">
          {search || contextFilter ? "No matches found." : t("empty")}
        </div>
      ) : (
        <div className="flex flex-col">
          {entries.map((entry) => (
            <WorkJournalListItem
              key={entry.id}
              entry={entry}
              isSelected={selectedId === entry.id}
              onClick={() => onSelect(entry.id)}
            />
          ))}
        </div>
      )}
    </FeatureSidebarPanel>
  );
}
