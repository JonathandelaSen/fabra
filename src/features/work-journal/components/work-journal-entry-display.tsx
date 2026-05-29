"use client";

import { useTranslations } from "next-intl";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";
import { TimelineEntryMeta } from "./timeline-entry-meta";
import { TimelineEntryActions } from "./timeline-entry-actions";
import { BasicPanel } from "@/components/shared/basic-panel";

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

      <BasicPanel className="p-6 md:p-8">
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
      </BasicPanel>
    </article>
  );
}

