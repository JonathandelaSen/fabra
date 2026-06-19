"use client";

import { useTranslations } from "next-intl";
import { IconLabelBadge } from "@/frontend/components/shared/icon-label-badge";
import { SidebarListItem } from "@/frontend/components/shared/sidebar-list-item";
import { formatDate } from "@/lib/format";
import type { ReceivedFeedbackItem } from "../api/received-feedback-api";

interface ReceivedFeedbackListItemProps {
  item: ReceivedFeedbackItem;
  isSelected: boolean;
  contextName: string | undefined;
  onClick: () => void;
}

export function ReceivedFeedbackListItem({
  item,
  isSelected,
  contextName,
  onClick,
}: ReceivedFeedbackListItemProps) {
  const t = useTranslations("receivedFeedback");

  return (
    <SidebarListItem
      title={item.giverName}
      selected={isSelected}
      onClick={onClick}
      subtitle={
        <p className="line-clamp-2 text-xs text-text-muted leading-relaxed">
          {item.feedbackText}
        </p>
      }
      footer={
        <>
          <IconLabelBadge
            text={contextName || t("labels.general")}
            className="max-w-[150px] truncate px-1.5 py-0.5 text-[10px]"
          />
          <span className="shrink-0 text-[10px] text-text-muted">
            {formatDate(item.receivedDate)}
          </span>
        </>
      }
    />
  );
}
