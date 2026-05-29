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
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkJournalEntryDisplay({
  entry,
  onEdit,
  onDelete,
}: TimelineEntryDisplayProps) {
  const t = useTranslations("workJournal");

  return (
    <article className="group w-full text-left">
      <div className="flex items-center justify-between mb-6 w-full gap-4">
        <TimelineEntryMeta entry={entry} />
        <TimelineEntryActions
          onEdit={onEdit}
          onDelete={onDelete}
          editLabel={t("editEntry")}
          deleteLabel={t("deleteEntry")}
        />
      </div>

      <div className="relative w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8">
        <p className="text-zinc-200 leading-[1.7] whitespace-pre-wrap w-full">
          {entry.final_text}
        </p>

        {entry.raw_notes !== entry.final_text && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
              {t("rawNotes")}
            </h4>
            <p className="text-[14px] leading-relaxed text-zinc-400 whitespace-pre-wrap w-full bg-black/20 p-4 rounded-xl border border-white/[0.02]">
              {entry.raw_notes}
            </p>
          </div>
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
