"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  CalendarDays,
  FilePenLine,
  FolderKanban,
  Pencil,
  Trash2,
} from "lucide-react";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";
import { WorkJournalSkeleton } from "./work-journal-skeleton";

interface WorkJournalTimelineProps {
  loading: boolean;
  filteredEntries: WorkJournalEntry[];
  editingEntryId: string | null;
  setEditingEntryId: (id: string | null) => void;
  onSave: (entry: WorkJournalEntry, updates: Partial<WorkJournalEntry>) => void;
  onDelete: (entry: WorkJournalEntry) => void;
}

export function WorkJournalTimeline({
  loading,
  filteredEntries,
  editingEntryId,
  setEditingEntryId,
  onSave,
  onDelete,
}: WorkJournalTimelineProps) {
  const t = useTranslations("workJournal");

  if (loading) {
    return <WorkJournalSkeleton />;
  }

  if (filteredEntries.length === 0) {
    return <EmptyState icon={FilePenLine} text={t("empty")} />;
  }

  return (
    <div className="pl-4 md:pl-8 py-4 relative">
      {filteredEntries.map((entry, index) => (
        <TimelineEntry
          key={`${entry.id}:${entry.updated_at}:${editingEntryId === entry.id ? "editing" : "view"}`}
          entry={entry}
          isLast={index === filteredEntries.length - 1}
          isEditing={editingEntryId === entry.id}
          onEdit={() => setEditingEntryId(entry.id)}
          onCancel={() => setEditingEntryId(null)}
          onSave={(updates) => onSave(entry, updates)}
          onDelete={() => onDelete(entry)}
        />
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-zinc-600">
      <Icon className="h-8 w-8 stroke-1 text-zinc-700" />
      <p className="text-sm font-light tracking-wide">{text}</p>
    </div>
  );
}

function TimelineEntry({
  entry,
  isLast,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  entry: WorkJournalEntry;
  isLast: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updates: Partial<WorkJournalEntry>) => void;
  onDelete: () => void;
}) {
  const t = useTranslations("workJournal");
  const common = useTranslations("common.actions");
  const [edit, setEdit] = useState(entry);

  if (isEditing) {
    return (
      <div className="relative pl-10 md:pl-16 pb-12 group text-left">
        {!isLast && <div className="absolute left-[11px] md:left-[19px] top-6 bottom-[-2rem] w-px bg-white/5" />}
        <div className="absolute left-0 md:left-2 top-1.5 h-6 w-6 rounded-full bg-black border-[3px] border-zinc-800 flex items-center justify-center z-10" />
        
        <div className="space-y-6 w-full">
          <div className="flex flex-wrap gap-4">
            <input
              type="date"
              className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1"
              value={edit.date_start}
              onChange={(e) => setEdit({ ...edit, date_start: e.target.value })}
            />
            <input
              type="date"
              className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1"
              value={edit.date_end || ""}
              onChange={(e) => setEdit({ ...edit, date_end: e.target.value || null })}
            />
            <input
              placeholder={t("editTopicPlaceholder")}
              className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1 flex-1 min-w-[200px]"
              value={edit.topic || ""}
              onChange={(e) => setEdit({ ...edit, topic: e.target.value || null })}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-2 block">{t("finalText")}</label>
              <textarea
                className="w-full bg-transparent text-[17px] md:text-lg font-light leading-relaxed text-zinc-200 placeholder:text-zinc-700 outline-none resize-y min-h-[240px] border border-white/10 rounded-xl p-4 focus:border-white/20 transition-colors"
                value={edit.final_text}
                onChange={(event) => setEdit({ ...edit, final_text: event.target.value })}
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-2 block">{t("rawNotes")}</label>
              <textarea
                className="w-full bg-transparent text-[15px] font-light leading-relaxed text-zinc-400 placeholder:text-zinc-700 outline-none resize-y min-h-[120px] border border-white/5 rounded-xl p-4 focus:border-white/20 transition-colors"
                value={edit.raw_notes}
                onChange={(event) => setEdit({ ...edit, raw_notes: event.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSave(edit)}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors"
            >
              {t("saveChanges")}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {common("cancel")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="relative pl-10 md:pl-16 pb-16 group w-full text-left">
      {!isLast && <div className="absolute left-[11px] md:left-[19px] top-6 bottom-[-1rem] w-px bg-white/[0.08]" />}
      <div className="absolute left-0 md:left-2 top-1.5 h-6 w-6 rounded-full bg-black border-[3px] border-zinc-800 flex items-center justify-center z-10 transition-colors group-hover:border-zinc-600">
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 group-hover:bg-zinc-400 transition-colors" />
      </div>

      <div className="flex items-center justify-between mb-3 w-full gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 tracking-wide">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {entry.date_start}
            {entry.date_end ? ` → ${entry.date_end}` : ""}
          </span>
          {entry.topic && (
            <>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <span className="text-zinc-400">{entry.topic}</span>
            </>
          )}
          {entry.context && (
            <>
              <span className="text-zinc-700 hidden sm:inline">•</span>
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

        {/* Actions (fade in on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
            title={t("editEntry")}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            title={t("deleteEntry")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
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
