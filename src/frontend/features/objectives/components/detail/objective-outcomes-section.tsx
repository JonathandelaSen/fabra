import { Pencil, Save, Trash2, X } from "lucide-react";
import type { ObjectiveOutcome, ObjectiveOutcomeStatus, ObjectiveOutcomeType } from "../../types";
import { outcomeLabels, type OutcomeEditForm } from "../objectives-ui";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_SIZES,
  ACTION_ICON_BUTTON_TONES,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Select } from "@/frontend/components/ui/select";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";
import { ObjectiveOutcomeAddBar, ObjectiveOutcomesHeader } from "./objective-outcomes-section-parts";

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
  onOutcomeFormChange: (form: OutcomeEditForm | null) => void;
  onSaveOutcome: () => void;
  onStopEditingOutcome: () => void;
  onUpdateOutcomeStatus: (outcome: ObjectiveOutcome, status: ObjectiveOutcomeStatus) => void;
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
    <BasicPanel className="flex flex-col overflow-hidden">
      <ObjectiveOutcomesHeader t={t} />

      <div className="p-5 flex flex-col gap-4">
        {outcomes.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-faint italic">
            {t("outcomes.empty")}
          </div>
        ) : (
          <div className="space-y-2.5">
            {outcomes.map((outcome) => {
              const isEditing = editingOutcomeId === outcome.id && outcomeForm;
              return (
                <div
                  key={outcome.id}
                  className="group rounded-xl border border-warning-border bg-warning/2 hover:bg-warning/5 transition-colors duration-150 overflow-hidden"
                >
                  {isEditing && outcomeForm ? (
                    <div className="space-y-3 p-4 bg-warning-soft">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-warning-text uppercase tracking-wider">
                          {t("outcomes.edit")}
                        </span>
                        <ActionIconButton
                          icon={X}
                          buttonSize={ACTION_ICON_BUTTON_SIZES.XS}
                          tone={ACTION_ICON_BUTTON_TONES.MUTED}
                          onClick={onStopEditingOutcome}
                        />
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
                        className="bg-field-code border-line focus-visible:ring-warning-border"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {t("fields.type")}
                          </span>
                          <Select
                            value={outcomeForm.type}
                            onChange={(e) => onOutcomeFormChange({ ...outcomeForm, type: e.target.value as ObjectiveOutcomeType })}
                          >
                            {Object.keys(outcomeLabels).map((key) => (
                              <option key={key} value={key} className="bg-panel-elevated text-text-on-bright">{outcomeLabel(key as ObjectiveOutcomeType)}</option>
                            ))}
                          </Select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {t("fields.status")}
                          </span>
                          <Select
                            value={outcomeForm.status}
                            onChange={(e) => onOutcomeFormChange({ ...outcomeForm, status: e.target.value as ObjectiveOutcomeStatus })}
                          >
                            {["expected", "achieved", "missed"].map((status) => (
                              <option key={status} value={status} className="bg-panel-elevated text-text-on-bright">{outcomeStatusLabel(status as ObjectiveOutcomeStatus)}</option>
                            ))}
                          </Select>
                        </label>
                      </div>
                      {(outcomeForm.type === "money" || outcomeForm.amount) && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1 block">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                              {t("fields.amount")}
                            </span>
                            <Input
                              type="number"
                              value={outcomeForm.amount}
                              onChange={(e) => onOutcomeFormChange({ ...outcomeForm, amount: e.target.value })}
                              placeholder="0"
                              className="bg-field-code border-line text-xs h-9 focus-visible:ring-warning-border"
                            />
                          </label>
                          <label className="space-y-1 block">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                              {t("fields.currency")}
                            </span>
                            <Input
                              value={outcomeForm.currency}
                              onChange={(e) => onOutcomeFormChange({ ...outcomeForm, currency: e.target.value })}
                              placeholder="EUR"
                              className="bg-field-code border-line text-xs h-9 focus-visible:ring-warning-border"
                            />
                          </label>
                        </div>
                      )}
                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {t("fields.description")}
                        </span>
                        <Textarea
                          rows={2}
                          value={outcomeForm.description}
                          onChange={(e) => onOutcomeFormChange({ ...outcomeForm, description: e.target.value })}
                          placeholder={t("outcomes.descriptionPlaceholder")}
                          className="bg-field-code border-line text-xs focus-visible:ring-warning-border min-h-0 py-2"
                        />
                      </label>
                      <div className="flex justify-end gap-2 pt-1 border-t border-line">
                        <IconTextButton icon={X} onClick={onStopEditingOutcome} className="h-8">
                          {t("actions.cancel")}
                        </IconTextButton>
                        <IconTextButton
                          icon={Save}
                          loading={saving}
                          tone={ICON_TEXT_BUTTON_TONES.WARNING}
                          onClick={onSaveOutcome}
                          disabled={saving}
                        >
                          {t("actions.save")}
                        </IconTextButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-warning-text">{outcome.title}</p>
                        {outcome.description && (
                          <p className="mt-1 text-xs leading-relaxed text-text-muted whitespace-pre-wrap">
                            {outcome.description}
                          </p>
                        )}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-warning-text/80 uppercase tracking-wider">
                          <span className="rounded bg-warning-soft border border-warning-border px-1.5 py-0.5">
                            {outcomeLabel(outcome.type)}
                          </span>
                          <span className="rounded bg-panel-control border border-line px-1.5 py-0.5 text-text-muted">
                            {outcomeStatusLabel(outcome.status)}
                          </span>
                          {outcome.amount != null && (
                            <span className="rounded bg-success-soft border border-success-border px-1.5 py-0.5 text-success-text">
                              {outcome.amount} {outcome.currency}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-line sm:border-t-0 shrink-0">
                        <Select
                          className="h-8 py-0.5 text-xs font-semibold w-auto px-2"
                          value={outcome.status}
                          onChange={(e) =>
                            onUpdateOutcomeStatus(outcome, e.target.value as ObjectiveOutcomeStatus)
                          }
                          disabled={isEmpty}
                        >
                          {["expected", "achieved", "missed"].map((status) => (
                            <option key={status} value={status} className="bg-panel-elevated text-text-on-bright">{outcomeStatusLabel(status as ObjectiveOutcomeStatus)}</option>
                          ))}
                        </Select>
                        <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <ActionIconButton
                            icon={Pencil}
                            tone={ACTION_ICON_BUTTON_TONES.MUTED}
                            onClick={() => onEditOutcome(outcome)}
                          />
                          <ActionIconButton
                            icon={Trash2}
                            tone={ACTION_ICON_BUTTON_TONES.DANGER}
                            onClick={() => onDeleteOutcome(outcome)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <ObjectiveOutcomeAddBar isEmpty={isEmpty} newOutcomeTitle={newOutcomeTitle} newOutcomeType={newOutcomeType} saving={saving} onCreateOutcome={onCreateOutcome} onNewOutcomeTitleChange={onNewOutcomeTitleChange} onNewOutcomeTypeChange={onNewOutcomeTypeChange} outcomeLabel={outcomeLabel} t={t} />
      </div>
    </BasicPanel>
  );
}
