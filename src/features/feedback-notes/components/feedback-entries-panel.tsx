"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Loader2, Lock, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackEntry } from "../api/feedback-notes-api";
import { formatDate } from "@/lib/format";

const textareaClass =
  "w-full resize-y border-white/10 bg-white/[0.03] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-60";

interface FeedbackEntriesPanelProps {
  entries: FeedbackEntry[];
  isClosed: boolean;
  isSaving: boolean;
  deletingEntryIds: Set<string>;
  onCreateEntry: (content: string) => void;
  onUpdateEntry: (entryId: string, content: string) => void;
  onDeleteEntry: (entryId: string) => void;
  isEditingMode: boolean;
}

export function FeedbackEntriesPanel({
  entries,
  isClosed,
  isSaving,
  deletingEntryIds,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  isEditingMode,
}: FeedbackEntriesPanelProps) {
  const t = useTranslations("feedbackNotes");
  const [entryDraft, setEntryDraft] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryEditDraft, setEntryEditDraft] = useState("");

  useEffect(() => {
    if (!isEditingMode) {
      setEditingEntryId(null);
    }
  }, [isEditingMode]);

  const submitEntry = () => {
    const content = entryDraft.trim();
    if (!content) return;
    setEntryDraft("");
    onCreateEntry(content);
  };

  const submitEdit = (entryId: string) => {
    const content = entryEditDraft.trim();
    if (!content) return;
    setEditingEntryId(null);
    onUpdateEntry(entryId, content);
  };

  return (
    <section className="min-w-0 space-y-4">
      {isClosed && (
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Lock className="h-3.5 w-3.5" />
            {t("status.closed")}
          </span>
        </div>
      )}
      {!isClosed && isEditingMode && (
        <div className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-3 mb-4">
          <label htmlFor="feedback-entry-draft" className="sr-only">
            {t("entries.placeholder")}
          </label>
          <Textarea
            id="feedback-entry-draft"
            value={entryDraft}
            onChange={(event) => setEntryDraft(event.target.value)}
            placeholder={t("entries.placeholder")}
            rows={4}
            disabled={isSaving}
            className="w-full resize-y border-transparent bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              onClick={submitEntry}
              disabled={isSaving || !entryDraft.trim()}
              className="min-w-[6.75rem] bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("entries.add")}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-500">{formatDate(entry.createdAt)}</p>
                {!isClosed && isEditingMode && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        setEditingEntryId(entry.id);
                        setEntryEditDraft(entry.content);
                      }}
                      disabled={deletingEntryIds.has(entry.id)}
                      className="text-zinc-500 hover:text-zinc-100"
                      aria-label={t("entries.edit")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDeleteEntry(entry.id)}
                      disabled={deletingEntryIds.has(entry.id)}
                      className="text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300"
                      aria-label={t("actions.delete")}
                    >
                      {deletingEntryIds.has(entry.id) ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
              {editingEntryId === entry.id ? (
                <div>
                  <Textarea
                    value={entryEditDraft}
                    onChange={(event) => setEntryEditDraft(event.target.value)}
                    rows={4}
                    className={textareaClass}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditingEntryId(null)}
                      className="text-zinc-400"
                      aria-label={t("actions.cancel")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => submitEdit(entry.id)}
                      aria-label={t("actions.save")}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {entry.content}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
