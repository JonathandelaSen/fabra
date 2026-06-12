"use client";

import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertCircle, User, Briefcase, MessageSquare } from "lucide-react";
import { useSubmitPublicCVFeedback } from "../hooks/use-submit-public-cv-feedback";

export function PublicFeedbackForm({ publicId }: { publicId: string }) {
  const t = useTranslations("publicCv.feedback");
  const submit = useSubmitPublicCVFeedback(publicId);

  if (submit.isSuccess) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/50 p-8 text-center shadow-sm backdrop-blur max-w-xl mx-auto my-6 animate-fade-in">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-emerald-950 tracking-tight">
          {t("successTitle")}
        </h3>
        <p className="mt-2 text-sm text-emerald-800 font-medium">
          {t("sent")}
        </p>
      </div>
    );
  }

  return (
    <form
      action={(data) => submit.mutate(Object.fromEntries(data))}
      className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm max-w-xl mx-auto"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-600" />
          {t("title")}
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
          {t("description")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Name input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {t("name")}
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-4 w-4 text-zinc-400" />
            <input
              name="giverName"
              placeholder={t("namePlaceholder")}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:shadow-sm"
            />
          </div>
        </div>

        {/* Context input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {t("context")}
          </label>
          <div className="relative flex items-center">
            <Briefcase className="absolute left-3.5 h-4 w-4 text-zinc-400" />
            <input
              name="giverContext"
              placeholder={t("contextPlaceholder")}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:shadow-sm"
            />
          </div>
        </div>

        {/* Honey pot element */}
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />

        {/* Message input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {t("message")} *
          </label>
          <textarea
            name="feedbackText"
            required
            maxLength={5000}
            placeholder={t("messagePlaceholder")}
            className="min-h-32 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-400 focus:bg-white focus:shadow-sm resize-y"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          disabled={submit.isPending}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5" />
          {submit.isPending ? t("sending") : t("send")}
        </button>

        {submit.isError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{t("error")}</span>
          </div>
        )}
      </div>
    </form>
  );
}
