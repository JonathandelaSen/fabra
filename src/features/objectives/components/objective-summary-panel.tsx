import { Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import { LabelBadge } from "@/components/shared/label-badge";
import { EditButton, DeleteButton } from "@/components/shared/action-buttons";
import type {
  ObjectiveContext,
  ObjectivePriority,
  ObjectiveSource,
  ObjectiveWithRelations,
} from "../api/objectives-api";
import { formatDate } from "./objectives-ui";

interface ObjectiveSummaryPanelProps {
  selected: ObjectiveWithRelations;
  selectedContext: ObjectiveContext | null;
  isEmpty: boolean;
  doneCount: number;
  totalItems: number;
  completion: number;
  onEditObjective: (objective: ObjectiveWithRelations) => void;
  onDeleteObjective: () => void;
  priorityLabel: (priority: ObjectivePriority) => string;
  sourceLabel: (source: ObjectiveSource) => string;
  t: (key: string, values?: Record<string, number | string>) => string;
}

export function ObjectiveSummaryPanel({
  selected,
  selectedContext,
  isEmpty,
  doneCount,
  totalItems,
  completion,
  onEditObjective,
  onDeleteObjective,
  priorityLabel,
  sourceLabel,
  t,
}: ObjectiveSummaryPanelProps) {
  const locale = useLocale();

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#101018] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {selected.priority && (
              <LabelBadge tone="warning" size="xs" className="uppercase" strong>
                {t("priorityBadge", { priority: priorityLabel(selected.priority) })}
              </LabelBadge>
            )}
            {selectedContext && (
              <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-zinc-400 font-medium text-[11px]">
                {selectedContext.name}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-50 lg:text-3xl leading-tight">
            {selected.title}
          </h2>
          {selected.description && (
            <p className="mt-3.5 text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
              {selected.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <EditButton
            onClick={() => onEditObjective(selected)}
            disabled={isEmpty}
          />
          <DeleteButton
            onClick={onDeleteObjective}
            disabled={isEmpty}
          />
        </div>
      </div>

      {/* Progress & Target Section */}
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

      {/* Success Criteria and closing reflection */}
      {(selected.successCriteria || selected.resultNotes) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/[0.06] pt-4">
          {selected.successCriteria && (
            <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] p-4.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/60">
                {t("fields.successCriteria")}
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {selected.successCriteria}
              </p>
            </div>
          )}

          {selected.resultNotes && (
            <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.02] p-4.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-400/60">
                {t("fields.result")}
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {selected.resultNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
