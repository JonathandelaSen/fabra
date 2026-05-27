import type { ObjectivePriority, ObjectiveSource, ObjectiveStatus } from "../api/objectives-api";
import { statusLabels, type ObjectiveForm } from "./objectives-ui";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ObjectivePlanningSectionProps {
  form: ObjectiveForm;
  onFormChange: (form: ObjectiveForm) => void;
  priorityLabel: (priority: ObjectivePriority) => string;
  sourceLabel: (source: ObjectiveSource) => string;
  statusLabel: (status: ObjectiveStatus) => string;
  t: (key: string) => string;
}

export function ObjectivePlanningSection({
  form,
  onFormChange,
  priorityLabel,
  sourceLabel,
  statusLabel,
  t,
}: ObjectivePlanningSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/[0.04] pb-1">
        Planning & Attributes
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-zinc-400">{t("fields.source")}</span>
          <Select
            value={form.source}
            onChange={(e) =>
              onFormChange({ ...form, source: e.target.value as ObjectiveSource })
            }
          >
            {["manager", "self", "company", "project", "other"].map((source) => (
              <option key={source} value={source} className="bg-[#101018] text-zinc-100">
                {sourceLabel(source as ObjectiveSource)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-zinc-400">{t("fields.status")}</span>
          <Select
            value={form.status}
            onChange={(e) =>
              onFormChange({ ...form, status: e.target.value as ObjectiveStatus })
            }
          >
            {Object.keys(statusLabels).map((status) => (
              <option key={status} value={status} className="bg-[#101018] text-zinc-100">
                {statusLabel(status as ObjectiveStatus)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-zinc-400">
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
            <option value="" className="bg-[#101018] text-zinc-100">{t("priority.none")}</option>
            <option value="low" className="bg-[#101018] text-zinc-100">{priorityLabel("low")}</option>
            <option value="medium" className="bg-[#101018] text-zinc-100">{priorityLabel("medium")}</option>
            <option value="high" className="bg-[#101018] text-zinc-100">{priorityLabel("high")}</option>
          </Select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-zinc-400">
            {t("fields.startDate")}
          </span>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => onFormChange({ ...form, startDate: e.target.value })}
            className="bg-zinc-950 border-white/[0.06] focus-visible:ring-emerald-500/20 py-2 h-auto text-sm"
          />
        </label>
        <label className="space-y-1.5 block text-left">
          <span className="text-xs font-semibold text-zinc-400">
            {t("fields.targetDate")}
          </span>
          <Input
            type="date"
            value={form.targetDate}
            onChange={(e) => onFormChange({ ...form, targetDate: e.target.value })}
            className="bg-zinc-950 border-white/[0.06] focus-visible:ring-emerald-500/20 py-2 h-auto text-sm"
          />
        </label>
      </div>
    </div>
  );
}
