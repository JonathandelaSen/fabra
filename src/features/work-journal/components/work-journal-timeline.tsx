"use client";

import { useTranslations } from "next-intl";
import { FilePenLine } from "lucide-react";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";
import { WorkJournalSkeleton } from "./work-journal-skeleton";
import { TimelineEmptyState } from "./timeline-empty-state";
import { TimelineEntryEditor } from "./timeline-entry-editor";
import { TimelineEntryDisplay } from "./timeline-entry-display";

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
    return <TimelineEmptyState icon={FilePenLine} text={t("empty")} />;
  }

  return (
    <div className="pl-4 md:pl-8 py-4 relative">
      {filteredEntries.map((entry, index) => {
        const isLast = index === filteredEntries.length - 1;
        const isEditing = editingEntryId === entry.id;

        if (isEditing) {
          return (
            <TimelineEntryEditor
              key={`${entry.id}:editing`}
              entry={entry}
              isLast={isLast}
              onSave={(updates) => onSave(entry, updates)}
              onCancel={() => setEditingEntryId(null)}
            />
          );
        }

        return (
          <TimelineEntryDisplay
            key={`${entry.id}:${entry.updated_at}`}
            entry={entry}
            isLast={isLast}
            onEdit={() => setEditingEntryId(entry.id)}
            onDelete={() => onDelete(entry)}
          />
        );
      })}
    </div>
  );
}
