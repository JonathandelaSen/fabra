"use client";

import { Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_TONES,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
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
        <ActionIconButton
          icon={X}
          onClick={onCancel}
          tone={ACTION_ICON_BUTTON_TONES.MUTED}
          disabled={saving}
        />
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
        <IconTextButton
          icon={X}
          onClick={onCancel}
          disabled={saving}
        >
          {t("actions.cancel")}
        </IconTextButton>
        <IconTextButton
          icon={Save}
          loading={saving}
          tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
          onClick={onSave}
          disabled={saving}
        >
          {t("actions.save")}
        </IconTextButton>
      </div>
    </section>
  );
}
