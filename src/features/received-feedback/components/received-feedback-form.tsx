"use client";

import { Loader2, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ActivityContextSelector } from "@/features/activity-context";
import type { ActivityContext } from "../api/received-feedback-api";

const inputClass =
  "w-full rounded-lg border border-line-default bg-panel-subtle px-3 py-2 text-sm text-text-main placeholder:text-text-faint outline-none transition-all focus:border-action-border focus:ring-1 focus:ring-action-soft";

const textareaClass =
  "w-full resize-none rounded-lg border border-line-default bg-panel-subtle px-3 py-2 text-sm text-text-main placeholder:text-text-faint outline-none transition-all focus:border-action-border focus:ring-1 focus:ring-action-soft";

export interface FormState {
  activityContextId: string;
  receivedDate: string;
  giverName: string;
  feedbackText: string;
  userNote: string;
}

interface ReceivedFeedbackFormProps {
  form: FormState;
  setForm: (form: FormState) => void;
  contexts: ActivityContext[];
  today: string;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onManageContexts: () => void;
  title: string;
  subtitle: string;
}

export function ReceivedFeedbackForm({
  form,
  setForm,
  contexts,
  today,
  saving,
  onSave,
  onCancel,
  onManageContexts,
  title,
  subtitle,
}: ReceivedFeedbackFormProps) {
  const t = useTranslations("receivedFeedback");

  return (
    <section className="rounded-xl border border-line bg-panel shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-main">{title}</h2>
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        </div>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon-sm"
          className="text-text-muted hover:text-text-soft"
          disabled={saving}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <ActivityContextSelector
            id="feedback-activity-context"
            label={t("fields.activityContext")}
            manageLabel={t("actions.manageContexts")}
            value={form.activityContextId}
            onChange={(val) => setForm({ ...form, activityContextId: val })}
            contexts={contexts}
            onManageClick={onManageContexts}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted">
            {t("fields.receivedDate")}
          </label>
          <input
            type="date"
            max={today}
            className={inputClass}
            value={form.receivedDate}
            onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted">
            {t("fields.from")}
          </label>
          <input
            className={inputClass}
            maxLength={120}
            placeholder={t("placeholders.from")}
            value={form.giverName}
            onChange={(e) => setForm({ ...form, giverName: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-text-muted">
            {t("fields.feedback")}
          </label>
          <textarea
            className={textareaClass}
            maxLength={10000}
            rows={6}
            placeholder={t("placeholders.feedback")}
            value={form.feedbackText}
            onChange={(e) => setForm({ ...form, feedbackText: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-text-muted">
            {t("fields.privateNote")}
          </label>
          <textarea
            className={textareaClass}
            maxLength={10000}
            rows={4}
            placeholder={t("placeholders.privateNote")}
            value={form.userNote}
            onChange={(e) => setForm({ ...form, userNote: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
        <Button
          onClick={onCancel}
          variant="ghost"
          disabled={saving}
          className="text-text-muted hover:text-text-soft"
        >
          {t("actions.cancel")}
        </Button>
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-action hover:bg-action-hover text-text-main font-medium"
        >
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          {t("actions.save")}
        </Button>
      </div>
    </section>
  );
}
