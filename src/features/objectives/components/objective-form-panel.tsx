import { Save, X } from "lucide-react";
import type {
  ObjectiveContext,
  ObjectivePriority,
  ObjectiveSource,
} from "../api/objectives-api";
import { type ObjectiveForm } from "./objectives-ui";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_TONES,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { ObjectiveIdentitySection } from "./objective-identity-section";
import { ObjectivePlanningSection } from "./objective-planning-section";
import { ObjectiveNarrativeSection } from "./objective-narrative-section";
import { BasicPanel } from "@/components/shared/basic-panel";

interface ObjectiveFormPanelProps {
  contexts: ObjectiveContext[];
  form: ObjectiveForm;
  isCreating: boolean;
  saving: boolean;
  onCancel: () => void;
  onFormChange: (form: ObjectiveForm) => void;
  onManageContexts: () => void;
  onSave: () => void;
  priorityLabel: (priority: ObjectivePriority) => string;
  sourceLabel: (source: ObjectiveSource) => string;
  t: (key: string) => string;
}

export function ObjectiveFormPanel({
  contexts,
  form,
  isCreating,
  saving,
  onCancel,
  onFormChange,
  onManageContexts,
  onSave,
  priorityLabel,
  sourceLabel,
  t,
}: ObjectiveFormPanelProps) {
  return (
    <BasicPanel className="flex flex-col overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between bg-white/[0.01]">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
          {isCreating ? t("newObjective") : t("editObjective")}
        </h2>
        <ActionIconButton
          icon={X}
          onClick={onCancel}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
        />
      </div>

      <div className="p-5 flex flex-col gap-6">
        <ObjectiveIdentitySection
          contexts={contexts}
          form={form}
          onFormChange={onFormChange}
          onManageContexts={onManageContexts}
          t={t}
        />

        <ObjectivePlanningSection
          form={form}
          onFormChange={onFormChange}
          priorityLabel={priorityLabel}
          sourceLabel={sourceLabel}
          t={t}
        />

        <ObjectiveNarrativeSection
          form={form}
          onFormChange={onFormChange}
          t={t}
        />

        <div className="mt-4 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
          <IconTextButton
            icon={X}
            onClick={onCancel}
          >
            {t("actions.cancel")}
          </IconTextButton>
          <IconTextButton
            icon={Save}
            loading={saving}
            tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
            onClick={onSave}
            disabled={saving}
          >
            {t("actions.save")}
          </IconTextButton>
        </div>
      </div>
    </BasicPanel>
  );
}
