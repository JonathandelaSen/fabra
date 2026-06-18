"use client";

import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertCircle, User, Briefcase, MessageSquare } from "lucide-react";
import { useSubmitPublicCVFeedback } from "../hooks/use-submit-public-cv-feedback";

export function PublicFeedbackForm({ publicId }: { publicId: string }) {
  const t = useTranslations("publicCv.feedback");
  const submit = useSubmitPublicCVFeedback(publicId);

  if (submit.isSuccess) {
    return (
      <div className="rounded-3xl border border-success-border bg-success-soft p-8 text-center shadow-none w-full mx-auto my-6 animate-fade-in dark:bg-success-soft dark:border-success-border">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success-text dark:bg-success/20 dark:text-success-text">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-text-main tracking-tight dark:text-success-text">
          {t("successTitle")}
        </h3>
        <p className="mt-2 text-sm text-success-text font-medium dark:text-success-text">
          {t("sent")}
        </p>
      </div>
    );
  }

  return (
    <form
      action={(data) => submit.mutate(Object.fromEntries(data))}
      className="space-y-6 rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-none w-full mx-auto dark:border-border dark:bg-card transition-all duration-200"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-text-main tracking-tight flex items-center gap-2 dark:text-foreground">
          <MessageSquare className="h-5 w-5 text-text-faint dark:text-text-muted" />
          {t("title")}
        </h2>
        <p className="text-xs text-text-muted leading-relaxed font-medium dark:text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Name input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-muted-foreground/70">
            {t("name")}
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-4 w-4 text-text-muted dark:text-muted-foreground/70" />
            <input
              name="giverName"
              placeholder={t("namePlaceholder")}
              className="w-full rounded-xl border border-line bg-panel pl-11 pr-4 py-2.5 text-xs text-text-main placeholder:text-text-muted outline-none transition-all focus:border-line-strong focus:bg-panel focus:shadow-sm dark:border-border dark:bg-muted/50 dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-primary/60 dark:focus:bg-card"
            />
          </div>
        </div>

        {/* Context input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-muted-foreground/70">
            {t("context")}
          </label>
          <div className="relative flex items-center">
            <Briefcase className="absolute left-3.5 h-4 w-4 text-text-muted dark:text-muted-foreground/70" />
            <input
              name="giverContext"
              placeholder={t("contextPlaceholder")}
              className="w-full rounded-xl border border-line bg-panel pl-11 pr-4 py-2.5 text-xs text-text-main placeholder:text-text-muted outline-none transition-all focus:border-line-strong focus:bg-panel focus:shadow-sm dark:border-border dark:bg-muted/50 dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-primary/60 dark:focus:bg-card"
            />
          </div>
        </div>

        {/* Honey pot element */}
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />

        {/* Message input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-muted-foreground/70">
            {t("message")} *
          </label>
          <textarea
            name="feedbackText"
            required
            maxLength={5000}
            placeholder={t("messagePlaceholder")}
            className="min-h-32 w-full rounded-xl border border-line bg-panel p-4 text-xs text-text-main placeholder:text-text-muted outline-none transition-all focus:border-line-strong focus:bg-panel focus:shadow-sm resize-y dark:border-border dark:bg-muted/50 dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-primary/60 dark:focus:bg-card"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          disabled={submit.isPending}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-text-main px-4 py-2 text-xs font-semibold text-text-inverse transition-all hover:bg-text-soft hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/95"
        >
          <Send className="h-3.5 w-3.5" />
          {submit.isPending ? t("sending") : t("send")}
        </button>

        {submit.isError && (
          <div className="flex items-center gap-2 rounded-xl border border-danger-border bg-danger-soft p-3 text-xs text-danger-text font-medium dark:border-danger-border dark:bg-danger-soft dark:text-danger-text">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{t("error")}</span>
          </div>
        )}
      </div>
    </form>
  );
}
