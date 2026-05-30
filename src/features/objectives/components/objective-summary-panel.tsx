import { LabelBadge, LABEL_BADGE_TONES } from "@/components/shared/label-badge";
import { EditButton, DeleteButton } from "@/components/shared/action-buttons";
import { BasicPanel } from "@/components/shared/basic-panel";
import { ObjectiveProgressSection } from "./objective-progress-section";
import type {
  ObjectiveContext,
  ObjectivePriority,
  ObjectiveSource,
  ObjectiveWithRelations,
} from "./objectives-ui";

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
  return (
    <BasicPanel className="p-5 flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {selected.priority && (
              <LabelBadge tone={LABEL_BADGE_TONES.WARNING} size="xs" className="uppercase" strong>
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

      <ObjectiveProgressSection
        selected={selected}
        doneCount={doneCount}
        totalItems={totalItems}
        completion={completion}
        t={t}
        sourceLabel={sourceLabel}
      />

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
    </BasicPanel>
  );
}
