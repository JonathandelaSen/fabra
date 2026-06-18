"use client";

import { useTranslations } from "next-intl";
import type { WorkJournalContext } from "../../api/work-journal-types";
import { ActivityContextSelector } from "@/features/activity-context";

const inputClass =
  "w-full bg-transparent border-b border-line/10 px-0 py-2 text-[15px] font-medium text-text-main placeholder:text-text-faint outline-none transition-colors focus:border-action-border/50 focus:ring-0";
const labelClass = "text-xs font-medium text-text-muted mb-1.5 block uppercase tracking-wider";

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
    <div className="space-y-6">
      <div className="-mx-1">
        <ActivityContextSelector
          id="work-journal-context"
          label={t("context")}
          manageLabel={t("manageContexts")}
          value={contextId}
          onChange={onContextChange}
          contexts={activeContexts}
          onManageClick={onManageContexts}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-line/5">
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
    </div>
  );
}
