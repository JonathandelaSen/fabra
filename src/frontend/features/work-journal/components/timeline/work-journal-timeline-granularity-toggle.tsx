"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/frontend/components/ui/button";
import type { TimelineGranularity } from "./work-journal-timeline-utils";

interface WorkJournalTimelineGranularityToggleProps {
  granularity: TimelineGranularity;
  onChange: (granularity: TimelineGranularity) => void;
}

export function WorkJournalTimelineGranularityToggle({
  granularity,
  onChange,
}: WorkJournalTimelineGranularityToggleProps) {
  const t = useTranslations("workJournal");

  const options: { value: TimelineGranularity; label: string }[] = [
    { value: "month", label: t("timeline.byMonth") },
    { value: "week", label: t("timeline.byWeek") },
  ];

  return (
    <div className="flex items-center rounded-lg border border-line bg-panel-subtle p-1">
      {options.map((option) => {
        const isActive = granularity === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`transition-all duration-200 ${
              isActive
                ? "bg-panel-base text-text-on-bright shadow-xs border border-line/40 font-semibold"
                : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
            }`}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
