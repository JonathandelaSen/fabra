"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
} from "lucide-react";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";

export function TimelineEntryMeta({ entry }: { entry: WorkJournalEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 tracking-wide">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {entry.date_start}
        {entry.date_end ? ` → ${entry.date_end}` : ""}
      </span>
      {entry.topic && (
        <>
          <span className="text-zinc-700 hidden sm:inline">&bull;</span>
          <span className="text-zinc-400">{entry.topic}</span>
        </>
      )}
      {entry.context && (
        <>
          <span className="text-zinc-700 hidden sm:inline">&bull;</span>
          <span className="text-zinc-500 opacity-70 flex items-center gap-1">
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
