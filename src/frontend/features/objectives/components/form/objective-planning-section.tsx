import type { ObjectivePriority, ObjectiveSource } from "../../api/objectives-api";
import { type ObjectiveForm } from "../objectives-ui";
import { Input } from "@/frontend/components/ui/input";
import { Select } from "@/frontend/components/ui/select";

interface ObjectivePlanningSectionProps {
  form: ObjectiveForm;
  onFormChange: (form: ObjectiveForm) => void;
  priorityLabel: (priority: ObjectivePriority) => string;
  sourceLabel: (source: ObjectiveSource) => string;
  t: (key: string) => string;
}

export function ObjectivePlanningSection({
  form,
  onFormChange,
  priorityLabel,
  sourceLabel,
  t,
}: ObjectivePlanningSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-action-text uppercase tracking-widest border-b border-line pb-1">
        {t("sections.planning")}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-text-muted">{t("fields.source")}</span>
          <Select
            value={form.source}
            onChange={(e) =>
              onFormChange({ ...form, source: e.target.value as ObjectiveSource })
            }
          >
            {["manager", "self", "company", "project", "other"].map((source) => (
              <option key={source} value={source} className="bg-panel-elevated text-text-on-bright">
                {sourceLabel(source as ObjectiveSource)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-text-muted">
            {t("fields.priority")}
          </span>
          <Select
            value={form.priority}
            onChange={(e) =>
              onFormChange({
                ...form,
                priority: e.target.value as "" | ObjectivePriority,
              })
            }
          >
            <option value="" className="bg-panel-elevated text-text-on-bright">{t("priority.none")}</option>
            <option value="low" className="bg-panel-elevated text-text-on-bright">{priorityLabel("low")}</option>
            <option value="medium" className="bg-panel-elevated text-text-on-bright">{priorityLabel("medium")}</option>
            <option value="high" className="bg-panel-elevated text-text-on-bright">{priorityLabel("high")}</option>
          </Select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-text-muted">
            {t("fields.startDate")}
          </span>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => onFormChange({ ...form, startDate: e.target.value })}
            className="bg-field-code border-line focus-visible:ring-success-border py-2 h-auto text-sm"
          />
        </label>
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-text-muted">
            {t("fields.targetDate")}
          </span>
          <Input
            type="date"
            value={form.targetDate}
            onChange={(e) => onFormChange({ ...form, targetDate: e.target.value })}
            className="bg-field-code border-line focus-visible:ring-success-border py-2 h-auto text-sm"
          />
        </label>
      </div>
    </div>
  );
}
