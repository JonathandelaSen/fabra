"use client";

import { useTranslations } from "next-intl";
import {
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  Pencil,
  Trash2,
} from "lucide-react";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";

interface TimelineEntryDisplayProps {
  entry: WorkJournalEntry;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function TimelineEntryDisplay({
  entry,
  isLast,
  onEdit,
  onDelete,
}: TimelineEntryDisplayProps) {
  const t = useTranslations("workJournal");

  return (
    <article className="relative pl-10 md:pl-16 pb-16 group w-full text-left">
      {!isLast && (
        <div className="absolute left-[11px] md:left-[19px] top-6 bottom-[-1rem] w-px bg-white/[0.08]" />
      )}
      <div className="absolute left-0 md:left-2 top-1.5 h-6 w-6 rounded-full bg-black border-[3px] border-zinc-800 flex items-center justify-center z-10 transition-colors group-hover:border-zinc-600">
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 group-hover:bg-zinc-400 transition-colors" />
      </div>

      <div className="flex items-center justify-between mb-3 w-full gap-4">
        <TimelineEntryMeta entry={entry} />
        <TimelineEntryActions
          onEdit={onEdit}
          onDelete={onDelete}
          editLabel={t("editEntry")}
          deleteLabel={t("deleteEntry")}
        />
      </div>

      <div className="relative w-full">
        <p className="text-[17px] md:text-lg font-light text-zinc-200 leading-[1.7] whitespace-pre-wrap w-full">
          {entry.final_text}
        </p>

        {entry.raw_notes !== entry.final_text && (
          <p className="mt-6 border-l-2 border-white/5 pl-4 text-[14px] leading-relaxed text-zinc-500 whitespace-pre-wrap w-full">
            {entry.raw_notes}
          </p>
        )}
      </div>
    </article>
  );
}

function TimelineEntryMeta({ entry }: { entry: WorkJournalEntry }) {
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

function TimelineEntryActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
}) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onEdit}
        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
        title={editLabel}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
        title={deleteLabel}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
