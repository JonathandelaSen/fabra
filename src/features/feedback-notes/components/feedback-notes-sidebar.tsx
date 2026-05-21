"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackFilter, FeedbackListItem } from "../api/feedback-notes-api";
import type { ActivityContext } from "@/features/activity-context";
import { FeedbackNotesListSkeleton } from "./feedback-notes-skeleton";
import { FeedbackNoteListItem } from "./feedback-note-list-item";

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
  const [personName, setPersonName] = useState("");
  const [selectedContextId, setSelectedContextId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const defaultContextId =
    contexts.find((c) => c.isDefault)?.id ?? contexts[0]?.id ?? "";

  const submit = () => {
    const trimmedName = personName.trim();
    if (!trimmedName) return;
    onCreate(trimmedName, selectedContextId || defaultContextId);
    setPersonName("");
    setIsCreateOpen(false);
  };

  const openActivityContextManager = () => {
    router.push(
      `/activity-contexts?source=feedback-notes&returnTo=${encodeURIComponent("/feedback-notes")}`
    );
  };

  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="mb-4 flex rounded-lg border border-white/[0.06] bg-white/[0.035] p-1">
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
        <div className="mb-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className={`w-full justify-start gap-2 text-xs font-semibold border transition-all duration-200 ${
              isCreateOpen
                ? "bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
                : "bg-indigo-600/5 text-indigo-300/90 border-indigo-500/10 hover:bg-indigo-600/15 hover:text-indigo-200 hover:border-indigo-500/25"
            }`}
          >
            <Plus
              className={`h-4 w-4 transition-transform duration-200 ${
                isCreateOpen ? "rotate-45 text-rose-400" : "text-indigo-400"
              }`}
            />
            {isCreateOpen ? t("actions.cancel") : t("actions.newNote")}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {isCreateOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex flex-col gap-3 border-t border-white/[0.04] pt-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-person-name" className="text-xs font-medium text-zinc-500">
                    {t("fields.personName")}
                  </label>
                  <input
                    id="feedback-person-name"
                    value={personName}
                    onChange={(event) => setPersonName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submit();
                    }}
                    placeholder={t("placeholders.personName")}
                    className="h-9 w-full rounded-lg border border-input bg-white/[0.03] px-2.5 py-1 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-activity-context" className="text-xs font-medium text-zinc-500">
                    {t("fields.activityContext")}
                  </label>
                  <select
                    id="feedback-activity-context"
                    value={selectedContextId || defaultContextId}
                    onChange={(e) => setSelectedContextId(e.target.value)}
                    className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-input bg-white/[0.03] px-2.5 py-1 text-sm text-zinc-100 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {contexts.map((context) => (
                      <option key={context.id} value={context.id} className="bg-[#1a1a24] text-zinc-100">
                        {context.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={openActivityContextManager}
                      className="px-0 text-xs text-zinc-500 hover:bg-transparent hover:text-indigo-300"
                    >
                      <Settings2 className="h-3 w-3" />
                      {t("actions.manageContexts")}
                    </Button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={isCreating || !personName.trim()}
                      className="inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-[0.8rem] font-medium text-white transition-colors hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-50"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
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
