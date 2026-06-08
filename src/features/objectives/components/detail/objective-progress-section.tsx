"use client";

import { Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import { formatDate } from "../objectives-ui";
import type { ObjectiveWithRelations, ObjectiveSource } from "../objectives-ui";

interface ObjectiveProgressSectionProps {
  selected: ObjectiveWithRelations;
  doneCount: number;
  totalItems: number;
  completion: number;
  t: (key: string, values?: Record<string, number | string>) => string;
  sourceLabel: (source: ObjectiveSource) => string;
}

export function ObjectiveProgressSection({
  selected,
  doneCount,
  totalItems,
  completion,
  t,
  sourceLabel,
}: ObjectiveProgressSectionProps) {
  const locale = useLocale();

  return (
    <div className="border-t border-white/[0.06] pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
            {t("items.title")}
          </span>
          <span className="text-zinc-300 font-semibold">
            {t("items.progress", { done: doneCount, total: totalItems, completion })}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.02]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 shrink-0 border-t md:border-t-0 border-white/[0.06] pt-3 md:pt-0">
        {selected.startDate && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
            <span>{t("started", { date: formatDate(selected.startDate, locale) })}</span>
          </span>
        )}
        {selected.targetDate && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-500/60" />
            <span className="text-amber-400/80 font-medium">
              {t("target", { date: formatDate(selected.targetDate, locale) })}
            </span>
          </span>
        )}
        {selected.source && selected.source !== "self" && (
          <span className="rounded-md bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 text-zinc-500">
            {t("sourceLabel", { source: sourceLabel(selected.source) })}
          </span>
        )}
      </div>
    </div>
  );
}
