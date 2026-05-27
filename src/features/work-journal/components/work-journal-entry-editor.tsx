"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";

interface TimelineEntryEditorProps {
  entry: WorkJournalEntry;
  onSave: (updates: Partial<WorkJournalEntry>) => void;
  onCancel: () => void;
}

export function WorkJournalEntryEditor({
  entry,
  onSave,
  onCancel,
}: TimelineEntryEditorProps) {
  const t = useTranslations("workJournal");
  const common = useTranslations("common.actions");
  const [edit, setEdit] = useState(entry);

  return (
    <div className="group text-left">
      <div className="space-y-6 w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap gap-4">
          <input
            type="date"
            className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1"
            value={edit.date_start}
            onChange={(e) => setEdit({ ...edit, date_start: e.target.value })}
          />
          <input
            type="date"
            className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1"
            value={edit.date_end || ""}
            onChange={(e) =>
              setEdit({ ...edit, date_end: e.target.value || null })
            }
          />
          <input
            placeholder={t("editTopicPlaceholder")}
            className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1 flex-1 min-w-[200px]"
            value={edit.topic || ""}
            onChange={(e) =>
              setEdit({ ...edit, topic: e.target.value || null })
            }
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">
              {t("finalText")}
            </label>
            <textarea
              className="w-full bg-transparent text-[17px] md:text-lg font-light leading-relaxed text-zinc-200 placeholder:text-zinc-700 outline-none resize-y min-h-[240px] border border-white/10 rounded-xl p-4 focus:border-white/20 transition-colors"
              value={edit.final_text}
              onChange={(event) =>
                setEdit({ ...edit, final_text: event.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">
              {t("rawNotes")}
            </label>
            <textarea
              className="w-full bg-transparent text-[15px] font-light leading-relaxed text-zinc-400 placeholder:text-zinc-700 outline-none resize-y min-h-[120px] border border-white/5 rounded-xl p-4 focus:border-white/20 transition-colors"
              value={edit.raw_notes}
              onChange={(event) =>
                setEdit({ ...edit, raw_notes: event.target.value })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(edit)}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors"
          >
            {t("saveChanges")}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {common("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
