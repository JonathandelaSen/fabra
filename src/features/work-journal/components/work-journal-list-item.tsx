"use client";

import { useTranslations } from "next-intl";
import { SidebarListItem } from "@/components/shared/sidebar-list-item";
import { LabelBadge } from "@/components/shared/label-badge";
import { formatDate } from "@/lib/format";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";

interface WorkJournalListItemProps {
  entry: WorkJournalEntry;
  isSelected: boolean;
  onClick: () => void;
}

export function WorkJournalListItem({
  entry,
  isSelected,
  onClick,
}: WorkJournalListItemProps) {
  const t = useTranslations("workJournal");

  const previewText = entry.final_text || entry.raw_notes || "";
  const displayTopic = entry.topic || t("newEntry");

  return (
    <SidebarListItem
      title={displayTopic}
      selected={isSelected}
      onClick={onClick}
      subtitle={
        <p className="truncate text-xs text-text-muted font-light">
          {previewText}
        </p>
      }
      footer={
        <>
          <div className="flex items-center gap-1.5 min-w-0">
            <LabelBadge size="xs" >
              {entry.context?.name || t("context")}
            </LabelBadge>
          </div>
          <span className="shrink-0 text-[11px] text-text-muted">
            {formatDate(entry.date_start)}
          </span>
        </>
      }
    />
  );
}
