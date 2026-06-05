"use client";

import { useTranslations } from "next-intl";
import { Briefcase, Link } from "lucide-react";

export function NewJobMatchOfferForm({
  title,
  jobUrl,
  jobDescription,
  onTitleChange,
  onJobUrlChange,
  onJobDescriptionChange,
}: {
  title: string;
  jobUrl: string;
  jobDescription: string;
  onTitleChange: (value: string) => void;
  onJobUrlChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
}) {
  const t = useTranslations("analysisFlow.newOffer");
  const formsT = useTranslations("analysisFlow.forms");

  return (
    <section className="grid gap-4 rounded-xl border border-line bg-white/[0.02] p-5">
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
          <Briefcase className="h-4 w-4" />
          {t("offerName")}
        </label>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={t("offerNamePlaceholder")}
          className="h-11 w-full rounded-xl border border-line bg-field px-4 text-sm text-text-main placeholder:text-text-faint focus:border-emerald-500/40 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
          <Link className="h-4 w-4" />
          {formsT("jobUrl")}
          <span className="rounded border border-white/[0.05] bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-500">
            {formsT("optional")}
          </span>
        </label>
        <input
          type="url"
          value={jobUrl}
          onChange={(event) => onJobUrlChange(event.target.value)}
          placeholder={formsT("jobUrlPlaceholder")}
          className="h-11 w-full rounded-xl border border-line bg-field px-4 text-sm text-text-main placeholder:text-text-faint focus:border-emerald-500/40 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
          <Briefcase className="h-4 w-4" />
          {formsT("jobDescription")}
          <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-400">
            {formsT("required")}
          </span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          placeholder={formsT("jobDescriptionPlaceholder")}
          className="h-52 w-full resize-none rounded-xl border border-line bg-field px-4 py-3 text-sm text-text-main placeholder:text-text-faint focus:border-emerald-500/40 focus:outline-none"
        />
      </div>
    </section>
  );
}
