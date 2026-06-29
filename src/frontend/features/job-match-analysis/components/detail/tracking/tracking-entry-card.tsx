"use client";

import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { JobMatchAnalysisTrackingEntryResponse } from "@/app/api/job-match-analyses/responses";
import { FormattedDate } from "@/frontend/components/shared/formatted-date";
import { Button } from "@/frontend/components/ui/button";
import { JobMatchAnalysisStatusBadge } from "../../list/job-match-analysis-status-badge";

interface TrackingEntryCardProps {
  entry: JobMatchAnalysisTrackingEntryResponse;
  onEdit: () => void;
  onDelete: () => void;
}

export function TrackingEntryCard({
  entry,
  onEdit,
  onDelete,
}: TrackingEntryCardProps) {
  const t = useTranslations("analysisDetail.tracking");

  return (
    <article className="relative rounded-xl border border-line bg-panel-raised p-4 shadow-sm transition-colors hover:border-line-strong sm:p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <JobMatchAnalysisStatusBadge status={entry.status} />
            <FormattedDate
              value={entry.occurredAt}
              variant="dateTime"
              icon={null}
              className="text-xs"
            />
          </div>
          {entry.title && (
            <h5 className="mt-3 text-base font-semibold text-text-main text-balance">
              {entry.title}
            </h5>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={t("edit")}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={t("delete")}
            className="text-danger-text hover:bg-danger-soft hover:text-danger-text"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>

      {entry.notes && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-muted">
          {entry.notes}
        </p>
      )}

      {entry.nextAction && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-action-border/25 bg-action/5 p-3">
          <ArrowRight className="mt-0.5 size-4 shrink-0 text-action-text" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              {t("nextAction")}
            </p>
            <p className="mt-1 text-sm font-medium text-text-main">
              {entry.nextAction}
            </p>
            {entry.nextActionAt && (
              <FormattedDate
                value={entry.nextActionAt}
                variant="dateTime"
                className="mt-1.5 text-xs"
              />
            )}
          </div>
        </div>
      )}
    </article>
  );
}
