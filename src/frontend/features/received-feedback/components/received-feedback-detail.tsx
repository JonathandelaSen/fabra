"use client";

import {
  CalendarDays,
  Lock,
  MessageSquareQuote,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { DeleteButton, EditButton } from "@/frontend/components/shared/action-buttons";
import { AlertBanner, ALERT_BANNER_TONES } from "@/frontend/components/shared/alert-banner";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";
import { IconLabelBadge } from "@/frontend/components/shared/icon-label-badge";
import { formatDate } from "@/frontend/utils/format";
import type {
  ActivityContext,
  ReceivedFeedbackItem,
} from "../api/received-feedback-api";

interface ReceivedFeedbackDetailProps {
  item: ReceivedFeedbackItem;
  contexts: ActivityContext[];
  onEdit: () => void;
  onDelete: () => void;
}

export function ReceivedFeedbackDetail({
  item,
  contexts,
  onEdit,
  onDelete,
}: ReceivedFeedbackDetailProps) {
  const t = useTranslations("receivedFeedback");
  const contextName =
    contexts.find((context) => context.id === item.activityContextId)?.name ||
    t("labels.general");

  return (
    <div className="flex flex-col gap-5">
      <BasicPanel as="section" className="p-3 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between border-b border-line pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold tracking-tight text-text-main">
              {item.giverName}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <IconLabelBadge text={contextName} />
              <IconLabelBadge
                icon={CalendarDays}
                text={formatDate(item.receivedDate)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <EditButton
              type="button"
              aria-label={t("actions.edit")}
              onClick={onEdit}
            />

            <DeleteButton
              type="button"
              aria-label={t("actions.delete")}
              onClick={onDelete}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-xl border border-line bg-panel-subtle p-3 sm:p-6 shadow-inner">
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-action-text mb-3">
                <MessageSquareQuote className="h-4 w-4" />
                {t("sections.feedbackContent")}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-soft">
                {item.feedbackText}
              </p>
            </div>
          </div>

          {item.userNote && (
            <AlertBanner
              tone={ALERT_BANNER_TONES.WARNING}
              icon={Lock}
              title={t("fields.privateNote")}
            >
              <div className="text-text-main whitespace-pre-wrap">{item.userNote}</div>
            </AlertBanner>
          )}
        </div>
      </BasicPanel>
    </div>
  );
}
