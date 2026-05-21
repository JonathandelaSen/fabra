"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Archive, Check, ChevronDown, Pencil, RefreshCw, Save, Settings2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FeedbackEntry, FeedbackListItem } from "../api/feedback-notes-api";
import type { ActivityContext } from "@/features/activity-context";
import { FeedbackEntriesPanel } from "./feedback-entries-panel";
import { FeedbackFinalPanel } from "./feedback-final-panel";

interface FeedbackNotesDetailProps {
  feedback: FeedbackListItem;
  entries: FeedbackEntry[];
  contexts: ActivityContext[];
  deletingEntryIds: Set<string>;
  isSaving: boolean;
  isGenerating: boolean;
  hasAIApiKey: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onUpdateFeedback: (
    updates: {
      personName?: string;
      finalFeedback?: string | null;
      activityContextId?: string;
    }
  ) => void;
  onDeleteFeedback: () => void;
  onCloseFeedback: () => void;
  onReopenFeedback: () => void;
  onCreateEntry: (content: string) => void;
  onUpdateEntry: (entryId: string, content: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onGenerate: () => void;
  onOpenCopyPaste: () => void;
  onOpenSettings?: () => void;
}

export function FeedbackNotesDetail({
  feedback,
  entries,
  contexts,
  deletingEntryIds,
  isSaving,
  isGenerating,
  onUpdateFeedback,
  onDeleteFeedback,
  onCloseFeedback,
  onReopenFeedback,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  onGenerate,
  onOpenCopyPaste,
  onOpenSettings,
  hasAIApiKey,
  selectedModel,
  onModelChange,
}: FeedbackNotesDetailProps) {
  const t = useTranslations("feedbackNotes");
  const router = useRouter();
  const [personNameDraft, setPersonNameDraft] = useState(feedback.personName);
  const [isEditing, setIsEditing] = useState(false);
  const isClosed = feedback.status === "closed";

  useEffect(() => {
    setPersonNameDraft(feedback.personName);
    setIsEditing(false);
  }, [feedback.id, feedback.personName]);

  return (
    <div className="flex w-full max-w-[1600px] flex-col gap-5">
      <section className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            {!isClosed && isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="min-w-0">
                  <label
                    htmlFor="feedback-detail-person-name"
                    className="mb-1.5 block text-xs font-medium text-zinc-500"
                  >
                    {t("fields.personName")}
                  </label>
                  <input
                    id="feedback-detail-person-name"
                    value={personNameDraft}
                    onChange={(event) => setPersonNameDraft(event.target.value)}
                    onInput={(event) => setPersonNameDraft(event.currentTarget.value)}
                    className="h-auto w-full border-b border-white/10 bg-transparent px-0 py-0.5 text-3xl font-semibold tracking-tight text-zinc-100 outline-none transition-colors focus:border-indigo-500 focus:text-white"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label
                    htmlFor="feedback-detail-context"
                    className="text-xs font-medium text-zinc-500"
                  >
                    {t("fields.activityContext")}
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="group relative min-w-0 max-w-xs">
                      <select
                        id="feedback-detail-context"
                        value={feedback.activityContextId}
                        onChange={(e) =>
                          onUpdateFeedback({ activityContextId: e.target.value })
                        }
                        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-input bg-white/[0.03] px-2.5 py-1 pr-8 text-sm text-zinc-200 outline-none transition-colors hover:bg-white/[0.05] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {contexts.map((context) => (
                          <option key={context.id} value={context.id} className="bg-[#1a1a24] text-zinc-100">
                            {context.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 transition-colors group-hover:text-zinc-300" />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/activity-contexts?source=feedback-notes&returnTo=${encodeURIComponent("/feedback-notes")}`)}
                        className="px-0 text-xs text-zinc-500 hover:bg-transparent hover:text-indigo-300"
                      >
                        <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                        {t("actions.manageContexts")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <h2 className="py-1 text-3xl font-semibold tracking-tight text-zinc-100 min-h-[2.5rem] flex items-center">
                  {feedback.personName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  {isClosed && (
                    <Badge
                      variant="outline"
                      className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                    >
                      {t(`status.${feedback.status}`)}
                    </Badge>
                  )}
                  <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2.5 py-1 text-sm font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                    {contexts.find((c) => c.id === feedback.activityContextId)?.name || t("fields.activityContext")}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <span>
                    {t("updated", { date: formatDate(feedback.updatedAt) })}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {!isClosed && isEditing && personNameDraft !== feedback.personName && (
              <Button
                type="button"
                onClick={() => onUpdateFeedback({ personName: personNameDraft })}
                variant="secondary"
              >
                <Save className="h-4 w-4" />
                {t("actions.saveName")}
              </Button>
            )}
            {!isClosed && (
              isEditing ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (personNameDraft.trim() !== feedback.personName) {
                      onUpdateFeedback({ personName: personNameDraft });
                    }
                    setIsEditing(false);
                  }}
                  variant="secondary"
                  className="bg-emerald-600/15 text-emerald-300 hover:bg-emerald-600/25 border border-emerald-500/20"
                >
                  <Check className="h-4 w-4" />
                  {t("actions.viewMode")}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  className="bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25 border border-indigo-500/20"
                >
                  <Pencil className="h-4 w-4" />
                  {t("actions.editMode")}
                </Button>
              )
            )}
            {isClosed ? (
              <Button
                type="button"
                onClick={onReopenFeedback}
                variant="secondary"
                className="bg-amber-600/15 text-amber-300 hover:bg-amber-600/25 border border-amber-500/20 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {t("actions.reopen")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onCloseFeedback}
                variant="secondary"
                className="bg-zinc-600/15 text-zinc-300 hover:bg-zinc-600/25 border border-zinc-500/20 hover:text-zinc-100 transition-colors"
              >
                <Archive className="h-4 w-4" />
                {t("actions.close")}
              </Button>
            )}
            <Button
              type="button"
              onClick={onDeleteFeedback}
              variant="destructive"
              className="bg-rose-600/15 text-rose-300 hover:bg-rose-600/25 border border-rose-500/20 hover:text-white transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {t("actions.delete")}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
        <FeedbackEntriesPanel
          entries={entries}
          isClosed={isClosed}
          isSaving={isSaving}
          deletingEntryIds={deletingEntryIds}
          onCreateEntry={onCreateEntry}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
          isEditingMode={isEditing}
        />
        <FeedbackFinalPanel
          feedback={feedback}
          entries={entries}
          isClosed={isClosed}
          isSaving={isSaving}
          isGenerating={isGenerating}
          hasAIApiKey={hasAIApiKey}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onSaveFinalFeedback={(finalFeedback) => onUpdateFeedback({ finalFeedback })}
          onGenerate={onGenerate}
          onOpenCopyPaste={onOpenCopyPaste}
          onOpenSettings={onOpenSettings}
          isEditingMode={isEditing}
        />
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
