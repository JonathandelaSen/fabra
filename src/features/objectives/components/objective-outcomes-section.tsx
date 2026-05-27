import { Loader2, Pencil, Save, Trash2, Trophy, X, Plus } from "lucide-react";
import type { ObjectiveOutcome, ObjectiveOutcomeStatus, ObjectiveOutcomeType } from "../api/objectives-api";
import { outcomeLabels, type OutcomeEditForm } from "./objectives-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ObjectiveOutcomesProps {
  editingOutcomeId: string | null;
  isEmpty: boolean;
  newOutcomeTitle: string;
  newOutcomeType: ObjectiveOutcomeType;
  outcomeForm: OutcomeEditForm | null;
  outcomes: ObjectiveOutcome[];
  saving: boolean;
  onCreateOutcome: () => void;
  onDeleteOutcome: (outcome: ObjectiveOutcome) => void;
  onEditOutcome: (outcome: ObjectiveOutcome) => void;
  onNewOutcomeTitleChange: (title: string) => void;
  onNewOutcomeTypeChange: (type: ObjectiveOutcomeType) => void;
  onOutcomeFormChange: (form: any) => void;
  onSaveOutcome: () => void;
  onStopEditingOutcome: () => void;
  onUpdateOutcomeStatus: (
    outcome: ObjectiveOutcome,
    status: ObjectiveOutcomeStatus
  ) => void;
  outcomeLabel: (type: ObjectiveOutcomeType) => string;
  outcomeStatusLabel: (status: ObjectiveOutcomeStatus) => string;
  t: (key: string) => string;
}

export function ObjectiveOutcomes({
  editingOutcomeId,
  isEmpty,
  newOutcomeTitle,
  newOutcomeType,
  outcomeForm,
  outcomes,
  saving,
  onCreateOutcome,
  onDeleteOutcome,
  onEditOutcome,
  onNewOutcomeTitleChange,
  onNewOutcomeTypeChange,
  onOutcomeFormChange,
  onSaveOutcome,
  onStopEditingOutcome,
  onUpdateOutcomeStatus,
  outcomeLabel,
  outcomeStatusLabel,
  t,
}: ObjectiveOutcomesProps) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-white/[0.06] px-5 py-4 flex items-center gap-2.5 bg-white/[0.01]">
        <Trophy className="h-4.5 w-4.5 text-amber-400" />
        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
          {t("outcomes.title")}
        </h3>
      </div>

      {/* Panel Body */}
      <div className="p-5 flex flex-col gap-4">
        {outcomes.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-600 italic">
            No expected outcomes defined yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {outcomes.map((outcome) => {
              const isEditing = editingOutcomeId === outcome.id && outcomeForm;
              return (
                <div
                  key={outcome.id}
                  className="group rounded-xl border border-amber-500/10 bg-amber-500/[0.01] hover:bg-amber-500/[0.02] transition-colors duration-150 overflow-hidden"
                >
                  {isEditing && outcomeForm ? (
                    <div className="space-y-3 p-4 bg-[#1e1c14]/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          {t("outcomes.edit")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={onStopEditingOutcome}
                          className="h-5 w-5 text-zinc-500 hover:text-zinc-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={outcomeForm.title}
                        onChange={(e) =>
                          onOutcomeFormChange({
                            ...outcomeForm,
                            title: e.target.value,
                          })
                        }
                        placeholder={t("outcomes.titlePlaceholder")}
                        className="bg-zinc-950/50 border-white/[0.06] focus-visible:ring-amber-500/20"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {t("fields.type")}
                          </span>
                          <select
                            className="w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 outline-none transition-colors focus:border-amber-500/30"
                            value={outcomeForm.type}
                            onChange={(e) =>
                              onOutcomeFormChange({
                                ...outcomeForm,
                                type: e.target.value as ObjectiveOutcomeType,
                              })
                            }
                          >
                            {Object.keys(outcomeLabels).map((key) => (
                              <option key={key} value={key} className="bg-zinc-950">
                                {outcomeLabel(key as ObjectiveOutcomeType)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {t("fields.status")}
                          </span>
                          <select
                            className="w-full rounded-lg border border-white/[0.06] bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 outline-none transition-colors focus:border-amber-500/30"
                            value={outcomeForm.status}
                            onChange={(e) =>
                              onOutcomeFormChange({
                                ...outcomeForm,
                                status: e.target.value as ObjectiveOutcomeStatus,
                              })
                            }
                          >
                            {["expected", "achieved", "missed"].map((status) => (
                              <option key={status} value={status} className="bg-zinc-950">
                                {outcomeStatusLabel(status as ObjectiveOutcomeStatus)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {(outcomeForm.type === "money" || outcomeForm.amount) && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1 block">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              {t("fields.amount")}
                            </span>
                            <Input
                              type="number"
                              value={outcomeForm.amount}
                              onChange={(e) =>
                                onOutcomeFormChange({
                                  ...outcomeForm,
                                  amount: e.target.value,
                                })
                              }
                              placeholder="0"
                              className="bg-zinc-950/50 border-white/[0.06] text-xs h-9 focus-visible:ring-amber-500/20"
                            />
                          </label>
                          <label className="space-y-1 block">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              {t("fields.currency")}
                            </span>
                            <Input
                              value={outcomeForm.currency}
                              onChange={(e) =>
                                onOutcomeFormChange({
                                  ...outcomeForm,
                                  currency: e.target.value,
                                })
                              }
                              placeholder="EUR"
                              className="bg-zinc-950/50 border-white/[0.06] text-xs h-9 focus-visible:ring-amber-500/20"
                            />
                          </label>
                        </div>
                      )}
                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {t("fields.description")}
                        </span>
                        <Textarea
                          rows={2}
                          value={outcomeForm.description}
                          onChange={(e) =>
                            onOutcomeFormChange({
                              ...outcomeForm,
                              description: e.target.value,
                            })
                          }
                          placeholder={t("outcomes.descriptionPlaceholder")}
                          className="bg-zinc-950/50 border-white/[0.06] text-xs focus-visible:ring-amber-500/20 min-h-0 py-2"
                        />
                      </label>
                      <div className="flex justify-end gap-2 pt-1 border-t border-white/[0.04]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onStopEditingOutcome}
                          className="h-8 text-zinc-400 hover:bg-white/[0.04]"
                        >
                          {t("actions.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={onSaveOutcome}
                          disabled={saving}
                          className="h-8 bg-amber-500 text-amber-950 hover:bg-amber-400 font-semibold gap-1.5"
                        >
                          {saving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          {t("actions.save")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-amber-100">
                          {outcome.title}
                        </p>
                        {outcome.description && (
                          <p className="mt-1 text-xs leading-relaxed text-zinc-400 whitespace-pre-wrap">
                            {outcome.description}
                          </p>
                        )}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5">
                            {outcomeLabel(outcome.type)}
                          </span>
                          <span className="rounded bg-white/[0.04] border border-white/[0.04] px-1.5 py-0.5 text-zinc-400">
                            {outcomeStatusLabel(outcome.status)}
                          </span>
                          {outcome.amount != null && (
                            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-emerald-400">
                              {outcome.amount} {outcome.currency}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <select
                          className="rounded-lg border border-white/[0.06] bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-zinc-300 outline-none transition-colors focus:border-amber-500/30"
                          value={outcome.status}
                          onChange={(e) =>
                            onUpdateOutcomeStatus(
                              outcome,
                              e.target.value as ObjectiveOutcomeStatus
                            )
                          }
                          disabled={isEmpty}
                        >
                          {["expected", "achieved", "missed"].map((status) => (
                            <option key={status} value={status} className="bg-zinc-950">
                              {outcomeStatusLabel(status as ObjectiveOutcomeStatus)}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onEditOutcome(outcome)}
                            className="h-7 w-7 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDeleteOutcome(outcome)}
                            className="h-7 w-7 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Outcome input bar */}
        <div className="mt-2 flex gap-2 border-t border-white/[0.04] pt-4">
          <select
            className="rounded-lg border border-white/[0.06] bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 outline-none shrink-0"
            value={newOutcomeType}
            onChange={(e) =>
              onNewOutcomeTypeChange(e.target.value as ObjectiveOutcomeType)
            }
            disabled={isEmpty}
          >
            {Object.keys(outcomeLabels).map((key) => (
              <option key={key} value={key} className="bg-zinc-950">
                {outcomeLabel(key as ObjectiveOutcomeType)}
              </option>
            ))}
          </select>
          <Input
            placeholder={t("outcomes.addPlaceholder")}
            value={newOutcomeTitle}
            onChange={(e) => onNewOutcomeTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onCreateOutcome();
            }}
            disabled={isEmpty}
            className="bg-zinc-950 border-white/[0.06] text-sm h-9 focus-visible:ring-amber-500/20"
          />
          <Button
            onClick={onCreateOutcome}
            disabled={saving || isEmpty}
            className="h-9 shrink-0 bg-amber-500 text-amber-950 hover:bg-amber-400 font-semibold gap-1.5 px-3.5"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            {t("actions.add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
