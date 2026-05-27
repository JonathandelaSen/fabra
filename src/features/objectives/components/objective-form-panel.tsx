import { Loader2, Save, X } from "lucide-react";
import type {
  ObjectiveContext,
  ObjectivePriority,
  ObjectiveSource,
  ObjectiveStatus,
} from "../api/objectives-api";
import {
  statusLabels,
  type ObjectiveForm,
} from "./objectives-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ActivityContextSelector } from "@/features/activity-context";

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
  statusLabel: (status: ObjectiveStatus) => string;
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
  statusLabel,
  t,
}: ObjectiveFormPanelProps) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-white/[0.06] px-5 py-4 flex items-center justify-between bg-white/[0.01]">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
          {isCreating ? t("newObjective") : t("editObjective")}
        </h2>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onCancel}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Panel Body */}
      <div className="p-5 flex flex-col gap-6">
        {/* Section 1: Identity */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/[0.04] pb-1">
            Identity & Context
          </h3>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">{t("fields.title")}</span>
            <Input
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              maxLength={160}
              placeholder="e.g. Lead the migration of frontend components"
              className="bg-zinc-950 border-white/[0.06] focus-visible:ring-emerald-500/20"
            />
          </label>

          <ActivityContextSelector
            label={t("fields.context")}
            manageLabel={t("actions.manageContexts")}
            value={form.contextId}
            onChange={(val) => onFormChange({ ...form, contextId: val })}
            contexts={contexts}
            onManageClick={onManageContexts}
          />
        </div>

        {/* Section 2: Planning & Attributes */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/[0.04] pb-1">
            Planning & Attributes
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1.5 block">
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
            <label className="space-y-1.5 block">
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
            <label className="space-y-1.5 block">
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
            <label className="space-y-1.5 block">
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
            <label className="space-y-1.5 block">
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

        {/* Section 3: Narrative & Reflection */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/[0.04] pb-1">
            Narrative & Success Criteria
          </h3>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">
              {t("fields.description")}
            </span>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => onFormChange({ ...form, description: e.target.value })}
              placeholder="What are the details of this objective?"
              className="bg-zinc-950 border-white/[0.06] focus-visible:ring-emerald-500/20 text-sm py-2"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">
              {t("fields.successCriteria")}
            </span>
            <Textarea
              rows={2.5}
              value={form.successCriteria}
              onChange={(e) =>
                onFormChange({ ...form, successCriteria: e.target.value })
              }
              placeholder={t("placeholders.successCriteria")}
              className="bg-zinc-950 border-white/[0.06] focus-visible:ring-emerald-500/20 text-sm py-2"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-amber-400/80">
              {t("fields.resultNotes")}
            </span>
            <Textarea
              rows={2.5}
              value={form.resultNotes}
              onChange={(e) => onFormChange({ ...form, resultNotes: e.target.value })}
              placeholder={t("placeholders.resultNotes")}
              className="bg-zinc-950 border-white/[0.06] focus-visible:ring-amber-500/20 text-sm py-2"
            />
          </label>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="h-9 px-4 text-zinc-400 hover:bg-white/[0.04]"
          >
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="h-9 px-4 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("actions.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
