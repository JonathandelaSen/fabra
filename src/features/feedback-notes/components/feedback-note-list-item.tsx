"use client";

import { useTranslations } from "next-intl";
import { featureMetaPillClassName } from "@/components/shared/feature-visual-system";
import { SidebarListItem } from "@/components/shared/sidebar-list-item";
import { LabelBadge } from "@/components/shared/label-badge";
import { formatDate } from "@/lib/format";
import type { FeedbackListItem } from "../api/feedback-notes-api";

interface FeedbackNoteListItemProps {
  feedback: FeedbackListItem;
  isSelected: boolean;
  onSelect: () => void;
}

export function FeedbackNoteListItem({
  feedback,
  isSelected,
  onSelect,
}: FeedbackNoteListItemProps) {
  const t = useTranslations("feedbackNotes");

  return (
    <SidebarListItem
      title={feedback.personName}
      selected={isSelected}
      onClick={onSelect}
      footer={
        <>
          <div className="flex items-center gap-1.5 min-w-0">
            {feedback.status === "closed" && (
              <LabelBadge tone="danger" size="xs" className="uppercase" strong>
                {t("status.closed")}
              </LabelBadge>
            )}
            <span className={`text-[11px] ${featureMetaPillClassName}`}>
              {feedback.activityContextName}
            </span>
          </div>
          <span className="shrink-0 text-[11px] text-text-muted">
            {formatDate(feedback.updatedAt)}
          </span>
        </>
      }
    />
  );
}
