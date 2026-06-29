"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  JobMatchAnalysisTrackingEntryResponse,
  JobMatchAnalysisOfferStatus,
} from "@/app/api/job-match-analyses/responses";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/utils/utils";
import { LABEL_BADGE_SIZES } from "@/frontend/components/shared/label-badge";
import { JobMatchAnalysisStatusBadge } from "../../list/job-match-analysis-status-badge";
import {
  TrackingUpdateForm,
  type CreateFollowUpEntryFields,
  type FollowUpEntryFields,
} from "../tracking/tracking-update-form";
import { TrackingTimeline } from "../tracking/tracking-timeline";

interface TabFollowUpProps {
  currentStatus: JobMatchAnalysisOfferStatus;
  entries: JobMatchAnalysisTrackingEntryResponse[];
  isSaving: boolean;
  onCreateEntry: (input: CreateFollowUpEntryFields) => Promise<void>;
  onUpdateEntry: (
    entryId: string,
    input: FollowUpEntryFields,
  ) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
}

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; entry: JobMatchAnalysisTrackingEntryResponse }
  | null;

const SHADOW_CLASSES: Record<JobMatchAnalysisOfferStatus, string> = {
  interesting: "shadow-[var(--ui-status-info-shadow)]",
  applied: "shadow-[var(--ui-status-action-shadow)]",
  interview: "shadow-[var(--ui-status-warning-shadow)] animate-pulse",
  offer: "shadow-[var(--ui-status-success-shadow)]",
  rejected: "",
  discarded: "",
};

export default function TabFollowUp({
  currentStatus,
  entries,
  isSaving,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
}: TabFollowUpProps) {
  const t = useTranslations("analysisDetail.tracking");
  const alerts = useTranslations("analysisDetail.alerts");
  const [editor, setEditor] = useState<EditorState>(null);

  return (
    <div className="w-full space-y-5">
      <section className="overflow-clip rounded-2xl border border-line bg-panel-base shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-panel-raised/60 p-5">
          <div className="min-w-0">
            <JobMatchAnalysisStatusBadge
              status={currentStatus}
              size={LABEL_BADGE_SIZES.SM}
              className={cn(
                "h-10 text-sm px-4 rounded-lg font-semibold inline-flex items-center justify-center transition-all duration-300 hover:scale-[1.03]",
                SHADOW_CLASSES[currentStatus],
              )}
              showDot
            />
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() => setEditor({ mode: "create" })}
            disabled={isSaving || editor?.mode === "create"}
            className="min-h-10"
          >
            <Plus aria-hidden="true" />
            {t("newUpdate")}
          </Button>
        </div>

        {editor && (
          <div className="border-b border-line bg-panel-subtle p-4 sm:p-5">
            <p className="mb-3 text-sm text-text-muted">
              {t("newUpdateDescription")}
            </p>
            <TrackingUpdateForm
              key={editor.mode === "edit" ? editor.entry.id : "create"}
              currentStatus={currentStatus}
              entry={editor.mode === "edit" ? editor.entry : undefined}
              isSaving={isSaving}
              onCancel={() => setEditor(null)}
              onSubmit={async (value) => {
                try {
                  if (editor.mode === "edit") {
                    await onUpdateEntry(
                      editor.entry.id,
                      value as FollowUpEntryFields,
                    );
                  } else {
                    await onCreateEntry(value as CreateFollowUpEntryFields);
                  }
                  setEditor(null);
                } catch (error) {
                  console.error(error);
                  alert(alerts("saveTrackingFailed"));
                }
              }}
            />
          </div>
        )}

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-text-faint">
              {t("history")}
            </h5>
            <span className="text-xs text-text-muted">
              {t("historyCount", { count: entries.length })}
            </span>
          </div>
          <TrackingTimeline
            entries={entries}
            onEdit={(entry) => setEditor({ mode: "edit", entry })}
            onDelete={(entry) => {
              void onDeleteEntry(entry.id).catch((error) => {
                console.error(error);
                alert(alerts("saveTrackingFailed"));
              });
            }}
          />
        </div>
      </section>
    </div>
  );
}
