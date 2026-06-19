import { Plus, Trophy } from "lucide-react";
import type { ObjectiveOutcomeType } from "../../types";
import { outcomeLabels } from "../objectives-ui";
import { Input } from "@/frontend/components/ui/input";
import { Select } from "@/frontend/components/ui/select";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/frontend/components/shared/action-buttons";

export function ObjectiveOutcomesHeader({ t }: { t: (key: string) => string }) {
  return (
    <div className="border-b border-line px-5 py-4 flex items-center gap-2.5 bg-panel-subtle">
      <Trophy className="h-4.5 w-4.5 text-warning-text" />
      <h3 className="text-sm font-bold text-text-soft uppercase tracking-wider">{t("outcomes.title")}</h3>
    </div>
  );
}

export function ObjectiveOutcomeAddBar({
  isEmpty,
  newOutcomeTitle,
  newOutcomeType,
  saving,
  onCreateOutcome,
  onNewOutcomeTitleChange,
  onNewOutcomeTypeChange,
  outcomeLabel,
  t,
}: {
  isEmpty: boolean;
  newOutcomeTitle: string;
  newOutcomeType: ObjectiveOutcomeType;
  saving: boolean;
  onCreateOutcome: () => void;
  onNewOutcomeTitleChange: (title: string) => void;
  onNewOutcomeTypeChange: (type: ObjectiveOutcomeType) => void;
  outcomeLabel: (type: ObjectiveOutcomeType) => string;
  t: (key: string) => string;
}) {
  return (
    <div className="mt-2 flex gap-2 border-t border-line pt-4">
      <Select className="w-32 py-1 h-9 text-xs shrink-0" value={newOutcomeType} onChange={(e) => onNewOutcomeTypeChange(e.target.value as ObjectiveOutcomeType)} disabled={isEmpty}>
        {Object.keys(outcomeLabels).map((key) => (
          <option key={key} value={key} className="bg-panel-elevated text-text-on-bright">{outcomeLabel(key as ObjectiveOutcomeType)}</option>
        ))}
      </Select>
      <Input
        placeholder={t("outcomes.addPlaceholder")}
        value={newOutcomeTitle}
        onChange={(e) => onNewOutcomeTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void onCreateOutcome();
        }}
        disabled={isEmpty}
        className="bg-field-code border-line text-sm h-9 focus-visible:ring-warning-border"
      />
      <IconTextButton icon={Plus} tone={ICON_TEXT_BUTTON_TONES.WARNING} onClick={onCreateOutcome} disabled={saving || isEmpty}>
        {t("actions.add")}
      </IconTextButton>
    </div>
  );
}
