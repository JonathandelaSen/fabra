import type { ObjectiveForm } from "../objectives-ui";
import { Textarea } from "@/components/ui/textarea";

interface ObjectiveNarrativeSectionProps {
  form: ObjectiveForm;
  onFormChange: (form: ObjectiveForm) => void;
  t: (key: string) => string;
}

export function ObjectiveNarrativeSection({
  form,
  onFormChange,
  t,
}: ObjectiveNarrativeSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-action-text uppercase tracking-widest border-b border-line pb-1">
        {t("sections.narrative")}
      </h3>
      <label className="block space-y-1.5 text-left">
        <span className="text-xs font-semibold text-text-muted">
          {t("fields.description")}
        </span>
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => onFormChange({ ...form, description: e.target.value })}
          placeholder={t("placeholders.details")}
          className="bg-field-code border-line focus-visible:ring-success-border text-sm py-2"
        />
      </label>

      <label className="block space-y-1.5 text-left">
        <span className="text-xs font-semibold text-text-muted">
          {t("fields.successCriteria")}
        </span>
        <Textarea
          rows={2.5}
          value={form.successCriteria}
          onChange={(e) =>
            onFormChange({ ...form, successCriteria: e.target.value })
          }
          placeholder={t("placeholders.successCriteria")}
          className="bg-field-code border-line focus-visible:ring-success-border text-sm py-2"
        />
      </label>

      <label className="block space-y-1.5 text-left">
        <span className="text-xs font-semibold text-warning-text/80">
          {t("fields.resultNotes")}
        </span>
        <Textarea
          rows={2.5}
          value={form.resultNotes}
          onChange={(e) => onFormChange({ ...form, resultNotes: e.target.value })}
          placeholder={t("placeholders.resultNotes")}
          className="bg-field-code border-line focus-visible:ring-warning-border text-sm py-2"
        />
      </label>
    </div>
  );
}
