"use client";

import { useState } from "react";
import { History, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  JobMatchAnalysisTrackingEntryResponse,
  JobMatchAnalysisOfferStatus,
} from "@/app/api/job-match-analyses/responses";
import { Button } from "@/frontend/components/ui/button";
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
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-panel-raised/60 p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-text-main">
              <History className="size-4 text-action-text" aria-hidden="true" />
              <h4 className="text-sm font-semibold">{t("title")}</h4>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-text-muted">
              {t("description")}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-text-faint">
                {t("currentStatus")}
              </span>
              <JobMatchAnalysisStatusBadge status={currentStatus} />
            </div>
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
