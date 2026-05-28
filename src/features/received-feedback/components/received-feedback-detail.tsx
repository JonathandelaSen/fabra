"use client";

import {
  CalendarDays,
  Lock,
  MessageSquareQuote,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { DeleteButton, EditButton } from "@/components/shared/action-buttons";
import { IconLabelBadge } from "@/components/shared/icon-label-badge";
import { formatDate } from "@/lib/format";
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
      <section className="rounded-xl border border-line bg-panel shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
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
              onClick={onEdit}
            />

            <DeleteButton
              type="button"
              onClick={onDelete}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-xl border border-line bg-panel-subtle p-6 shadow-inner">
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
            <div className="rounded-xl border border-warning-border bg-warning-soft p-5">
              <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning-text">
                <Lock className="h-3.5 w-3.5" />
                {t("fields.privateNote")}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-soft">
                {item.userNote}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
