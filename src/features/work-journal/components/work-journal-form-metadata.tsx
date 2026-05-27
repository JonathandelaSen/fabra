"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import type { WorkJournalContextLegacy as WorkJournalContext } from "../api/work-journal-types";

const inputClass =
  "w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-300 focus:ring-0";
const labelClass = "text-xs font-medium text-zinc-500 mb-1 block";

interface WorkJournalFormMetadataProps {
  contextId: string;
  onContextChange: (id: string) => void;
  dateStart: string;
  onDateStartChange: (date: string) => void;
  dateEnd: string;
  onDateEndChange: (date: string) => void;
  topic: string;
  onTopicChange: (topic: string) => void;
  activeContexts: WorkJournalContext[];
  onManageContexts: () => void;
}

export function WorkJournalFormMetadata({
  contextId,
  onContextChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange,
  topic,
  onTopicChange,
  activeContexts,
  onManageContexts,
}: WorkJournalFormMetadataProps) {
  const t = useTranslations("workJournal");

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="work-journal-context" className={labelClass}>
          {t("context")}
        </label>
        <select
          id="work-journal-context"
          className={inputClass}
          value={contextId}
          onChange={(event) => onContextChange(event.target.value)}
        >
          <option value="" disabled className="bg-zinc-900 text-zinc-500">
            {t("selectContext")}
          </option>
          {activeContexts.map((context) => (
            <option
              key={`form-ctx-${context.id}`}
              value={context.id}
              className="bg-zinc-900 text-zinc-200"
            >
              {context.name}{" "}
              {context.type === "project" ? t("projectSuffix") : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>{t("dateFrom")}</label>
          <input
            type="date"
            className={inputClass}
            value={dateStart}
            onChange={(event) => onDateStartChange(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>{t("dateTo")}</label>
          <input
            type="date"
            className={inputClass}
            value={dateEnd}
            onChange={(event) => onDateEndChange(event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t("topic")}</label>
        <input
          className={inputClass}
          placeholder={t("topicPlaceholder")}
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
        />
      </div>

      <div className="pt-6 border-t border-white/5">
        <button
          type="button"
          onClick={onManageContexts}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          {t("manageContexts")}
        </button>
      </div>
    </div>
  );
}
