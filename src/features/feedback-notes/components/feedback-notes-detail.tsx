"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Archive, RefreshCw, Save, Settings2, Trash2 } from "lucide-react";
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
  onGenerate: (model: string) => void;
  onCopyPrompt: (prompt: string) => void;
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
  onCopyPrompt,
}: FeedbackNotesDetailProps) {
  const t = useTranslations("feedbackNotes");
  const router = useRouter();
  const [personNameDraft, setPersonNameDraft] = useState(feedback.personName);
  const isClosed = feedback.status === "closed";

  useEffect(() => {
    setPersonNameDraft(feedback.personName);
  }, [feedback.id, feedback.personName]);

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <section className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {t("fields.personName")}
              </label>
              <input
                value={personNameDraft}
                onChange={(event) => setPersonNameDraft(event.target.value)}
                disabled={isClosed}
                className="w-full bg-transparent text-3xl font-bold tracking-tight text-zinc-100 outline-none transition-all focus:text-white disabled:opacity-80"
              />
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <label className="ml-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {t("fields.activityContext")}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <select
                    value={feedback.activityContextId}
                    onChange={(e) =>
                      onUpdateFeedback({ activityContextId: e.target.value })
                    }
                    disabled={isClosed}
                    className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 pr-8 text-xs font-semibold text-zinc-300 outline-none transition-all hover:bg-white/[0.08] hover:text-white hover:border-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contexts.map((context) => (
                      <option key={context.id} value={context.id} className="bg-[#1a1a24] text-zinc-100">
                        {context.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/activity-contexts?source=feedback-notes&returnTo=${encodeURIComponent("/feedback-notes")}`)}
                  className="flex items-center gap-1.5 rounded-full px-2 py-1 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-indigo-400"
                  title={t("actions.manageContexts")}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium">{t("actions.manageContexts")}</span>
                </button>
              </div>
            </div>
          </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isClosed && personNameDraft !== feedback.personName && (
            <button
              type="button"
              onClick={() => onUpdateFeedback({ personName: personNameDraft })}
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/[0.12]"
            >
              <Save className="h-4 w-4" />
              {t("actions.saveName")}
            </button>
          )}
          {isClosed ? (
            <button
              type="button"
              onClick={onReopenFeedback}
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/[0.12]"
            >
              <RefreshCw className="h-4 w-4" />
              {t("actions.reopen")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onCloseFeedback}
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/[0.12]"
            >
              <Archive className="h-4 w-4" />
              {t("actions.close")}
            </button>
          )}
          <button
            type="button"
            onClick={onDeleteFeedback}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/15"
          >
            <Trash2 className="h-4 w-4" />
            {t("actions.delete")}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <FeedbackEntriesPanel
          entries={entries}
          isClosed={isClosed}
          isSaving={isSaving}
          deletingEntryIds={deletingEntryIds}
          onCreateEntry={onCreateEntry}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
        />
        <FeedbackFinalPanel
          feedback={feedback}
          entries={entries}
          isClosed={isClosed}
          isSaving={isSaving}
          isGenerating={isGenerating}
          onSaveFinalFeedback={(finalFeedback) => onUpdateFeedback({ finalFeedback })}
          onGenerate={onGenerate}
          onCopyPrompt={onCopyPrompt}
        />
      </section>
    </div>
  );
}
