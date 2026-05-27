import type { ObjectiveContext } from "../api/objectives-api";
import type { ObjectiveForm } from "./objectives-ui";
import { Input } from "@/components/ui/input";
import { ActivityContextSelector } from "@/features/activity-context";

interface ObjectiveIdentitySectionProps {
  contexts: ObjectiveContext[];
  form: ObjectiveForm;
  onFormChange: (form: ObjectiveForm) => void;
  onManageContexts: () => void;
  t: (key: string) => string;
}

export function ObjectiveIdentitySection({
  contexts,
  form,
  onFormChange,
  onManageContexts,
  t,
}: ObjectiveIdentitySectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/[0.04] pb-1">
        Identity & Context
      </h3>
      <label className="block space-y-1.5 text-left">
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
  );
}
