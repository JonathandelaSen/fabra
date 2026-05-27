"use client";

import { Loader2, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ActivityContextSelector } from "@/features/activity-context";
import type { ActivityContext } from "../api/received-feedback-api";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20";

const textareaClass =
  "w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20";

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
    <section className="rounded-xl border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/[0.04] pb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
          <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
        </div>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon-sm"
          className="text-zinc-500 hover:text-zinc-200"
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
          <label className="text-xs font-semibold text-zinc-400">
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
          <label className="text-xs font-semibold text-zinc-400">
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
          <label className="text-xs font-semibold text-zinc-400">
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
          <label className="text-xs font-semibold text-zinc-400">
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

      <div className="mt-6 flex justify-end gap-2 border-t border-white/[0.04] pt-4">
        <Button
          onClick={onCancel}
          variant="ghost"
          disabled={saving}
          className="text-zinc-400 hover:text-zinc-200"
        >
          {t("actions.cancel")}
        </Button>
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
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
