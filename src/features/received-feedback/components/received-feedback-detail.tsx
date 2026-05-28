"use client";

import {
  CalendarDays,
  Lock,
  MessageSquareQuote,
  Pencil,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type {
  ActivityContext,
  ReceivedFeedbackItem,
} from "../api/received-feedback-api";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-panel shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between border-b border-line pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold tracking-tight text-text-main">
              {item.giverName}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-action-soft px-2.5 py-1 text-xs font-semibold text-action-text ring-1 ring-inset ring-action-border">
                {contexts.find((c) => c.id === item.activityContextId)?.name ||
                  t("labels.general")}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md bg-panel-hover px-2.5 py-1 text-xs font-medium text-text-muted ring-1 ring-inset ring-line">
                <CalendarDays className="h-3.5 w-3.5 text-text-muted" />
                {formatDate(item.receivedDate)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Button
              type="button"
              onClick={onEdit}
              variant="secondary"
              size="sm"
              className="bg-action-soft text-action-text hover:bg-action-soft border border-action-border font-medium transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("actions.edit")}
            </Button>

            <Button
              type="button"
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="bg-danger-soft text-danger-text hover:bg-danger-soft border border-danger-border transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("actions.delete")}
            </Button>
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
