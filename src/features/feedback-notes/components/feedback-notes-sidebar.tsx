"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Settings2 } from "lucide-react";
import type { FeedbackFilter, FeedbackListItem } from "../api/feedback-notes-api";
import type { ActivityContext } from "@/features/activity-context";
import { FeedbackNotesListSkeleton } from "./feedback-notes-skeleton";
import { FeedbackNoteListItem } from "./feedback-note-list-item";

const inputClass =
  "w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-300 focus:ring-0";

interface FeedbackNotesSidebarProps {
  feedbacks: FeedbackListItem[];
  contexts: ActivityContext[];
  selectedId: string | null;
  status: FeedbackFilter;
  isLoading: boolean;
  isCreating: boolean;
  onStatusChange: (status: FeedbackFilter) => void;
  onSelect: (feedbackId: string) => void;
  onRefresh: () => void;
  onCreate: (personName: string, activityContextId: string) => void;
}

export function FeedbackNotesSidebar({
  feedbacks,
  contexts,
  selectedId,
  status,
  isLoading,
  isCreating,
  onStatusChange,
  onSelect,
  onRefresh,
  onCreate,
}: FeedbackNotesSidebarProps) {
  const t = useTranslations("feedbackNotes");
  const router = useRouter();
  const [newPersonName, setNewPersonName] = useState("");
  const [selectedContextId, setSelectedContextId] = useState("");

  const defaultContextId =
    contexts.find((c) => c.isDefault)?.id ?? contexts[0]?.id ?? "";

  const submit = () => {
    const personName = newPersonName.trim();
    if (!personName) return;
    onCreate(personName, selectedContextId || defaultContextId);
    setNewPersonName("");
  };

  const openActivityContextManager = () => {
    router.push(
      `/activity-contexts?source=feedback-notes&returnTo=${encodeURIComponent("/feedback-notes")}`
    );
  };

  return (
    <aside className="flex w-full max-w-sm shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0d14]/80">
      <div className="border-b border-white/[0.06] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">{t("title")}</h1>
            <p className="text-xs text-zinc-500">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
              title={t("actions.refresh")}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mb-4 flex rounded-lg bg-white/[0.04] p-1">
          {(["active", "closed", "all"] as FeedbackFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onStatusChange(item)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === item
                  ? "bg-white/[0.10] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t(`filters.${item}`)}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 ml-1">
              {t("fields.personName")}
            </label>
            <input
              value={newPersonName}
              onChange={(event) => setNewPersonName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              placeholder="e.g. Jonathan Doe"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08]"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {t("fields.activityContext")}
            </label>
            <select
              value={selectedContextId || defaultContextId}
              onChange={(e) => setSelectedContextId(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none transition-all focus:border-indigo-500/50 appearance-none cursor-pointer"
            >
              {contexts.map((context) => (
                <option key={context.id} value={context.id} className="bg-[#1a1a24] text-zinc-100">
                  {context.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-3">
              <button
                type="button"
                onClick={openActivityContextManager}
                className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 transition-colors hover:text-indigo-400"
              >
                <Settings2 className="h-3 w-3" />
                {t("actions.manageContexts")}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isCreating || !newPersonName.trim()}
                className="h-8 px-4 flex items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {isCreating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {t("actions.add")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <FeedbackNotesListSkeleton />
        ) : feedbacks.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">
            {t("empty")}
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <FeedbackNoteListItem
              key={feedback.id}
              feedback={feedback}
              isSelected={selectedId === feedback.id}
              onSelect={() => onSelect(feedback.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
