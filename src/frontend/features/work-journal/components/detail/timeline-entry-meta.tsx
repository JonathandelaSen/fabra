"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
} from "lucide-react";
import type { WorkJournalEntry } from "../../api/work-journal-types";

export function TimelineEntryMeta({ entry }: { entry: WorkJournalEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-text-muted tracking-wide">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {entry.dateStart}
        {entry.dateEnd ? ` → ${entry.dateEnd}` : ""}
      </span>
      {entry.topic && (
        <>
          <span className="text-text-faint hidden sm:inline">&bull;</span>
          <span className="text-text-muted">{entry.topic}</span>
        </>
      )}
      {entry.context && (
        <>
          <span className="text-text-faint hidden sm:inline">&bull;</span>
          <span className="text-text-muted opacity-70 flex items-center gap-1">
            {entry.context.type === "project" ? (
              <FolderKanban className="h-3 w-3" />
            ) : (
              <BriefcaseBusiness className="h-3 w-3" />
            )}
            {entry.context.name}
          </span>
        </>
      )}
    </div>
  );
}
