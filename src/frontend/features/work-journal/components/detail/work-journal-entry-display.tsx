"use client";

import { useTranslations } from "next-intl";
import type { WorkJournalEntry } from "../../api/work-journal-types";
import { TimelineEntryMeta } from "./timeline-entry-meta";
import { TimelineEntryActions } from "./timeline-entry-actions";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";

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
        <p className="text-text-soft leading-[1.7] whitespace-pre-wrap w-full">
          {entry.finalText}
        </p>

        {entry.rawNotes !== entry.finalText && (
          <div className="mt-8 pt-6 border-t border-line">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
              {t("rawNotes")}
            </h4>
            <p className="text-[14px] leading-relaxed text-text-muted whitespace-pre-wrap w-full bg-field p-4 rounded-xl border border-line">
              {entry.rawNotes}
            </p>
          </div>
        )}
      </BasicPanel>
    </article>
  );
}

