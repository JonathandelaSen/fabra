"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Lock, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackEntry } from "../api/feedback-notes-api";
import { formatDate } from "@/lib/format";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_TONES,
  EditButton,
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { BasicPanel } from "@/components/shared/basic-panel";

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
        <BasicPanel className="p-3 mb-4">
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
            <IconTextButton
              icon={Plus}
              loading={isSaving}
              tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
              onClick={submitEntry}
              disabled={isSaving || !entryDraft.trim()}
              className="min-w-[6.75rem]"
            >
              {t("entries.add")}
            </IconTextButton>
          </div>
        </BasicPanel>
      )}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <BasicPanel
              as={motion.div}
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-500">{formatDate(entry.createdAt)}</p>
                {!isClosed && isEditingMode && (
                  <div className="flex items-center gap-1">
                    <EditButton
                      onClick={() => {
                        setEditingEntryId(entry.id);
                        setEntryEditDraft(entry.content);
                      }}
                      disabled={deletingEntryIds.has(entry.id)}
                      aria-label={t("entries.edit")}
                    />
                    <DeleteButton
                      onClick={() => onDeleteEntry(entry.id)}
                      disabled={deletingEntryIds.has(entry.id)}
                      aria-label={t("actions.delete")}
                    />
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
                    <ActionIconButton
                      type="button"
                      icon={X}
                      onClick={() => setEditingEntryId(null)}
                      tone={ACTION_ICON_BUTTON_TONES.MUTED}
                      aria-label={t("actions.cancel")}
                    />
                    <ActionIconButton
                      type="button"
                      icon={Save}
                      tone={ACTION_ICON_BUTTON_TONES.SUCCESS}
                      onClick={() => submitEdit(entry.id)}
                      aria-label={t("actions.save")}
                    />
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {entry.content}
                </p>
              )}
            </BasicPanel>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
