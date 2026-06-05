"use client";

import { CalendarRange, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { WorkJournalRouteView } from "../hooks/use-work-journal-route-state";

interface WorkJournalViewToggleProps {
  view: WorkJournalRouteView;
  onGoToList: () => void;
  onGoToTimeline: () => void;
}

export function WorkJournalViewToggle({
  view,
  onGoToList,
  onGoToTimeline,
}: WorkJournalViewToggleProps) {
  const t = useTranslations("workJournal");
  const listActive = view === "list";
  const timelineActive = view === "timeline";

  return (
    <div className="flex items-center rounded-lg border border-line bg-panel-subtle p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onGoToList}
        aria-pressed={listActive}
        className={`transition-all duration-200 ${
          listActive
            ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
            : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
        }`}
      >
        <List className={`h-4 w-4 transition-colors ${listActive ? "text-action" : "text-text-soft"}`} />
        {t("timeline.listView")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onGoToTimeline}
        aria-pressed={timelineActive}
        className={`transition-all duration-200 ${
          timelineActive
            ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
            : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
        }`}
      >
        <CalendarRange className={`h-4 w-4 transition-colors ${timelineActive ? "text-action" : "text-text-soft"}`} />
        {t("timeline.timelineView")}
      </Button>
    </div>
  );
}
