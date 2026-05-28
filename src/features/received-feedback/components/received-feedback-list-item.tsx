"use client";

import { useTranslations } from "next-intl";
import { featureMetaPillClassName } from "@/components/shared/feature-visual-system";
import { SidebarListItem } from "@/components/shared/sidebar-list-item";
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
          <span className={`text-[10px] ${featureMetaPillClassName}`}>
            {contextName || t("labels.general")}
          </span>
          <span className="shrink-0 text-[10px] text-text-muted">
            {formatDate(item.receivedDate)}
          </span>
        </>
      }
    />
  );
}
