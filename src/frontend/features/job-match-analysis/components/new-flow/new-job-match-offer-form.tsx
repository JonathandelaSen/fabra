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
    <section className="grid gap-4 rounded-xl border border-line bg-panel/[0.02] p-5">
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm text-text-muted">
          <Briefcase className="h-4 w-4" />
          {t("offerName")}
        </label>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={t("offerNamePlaceholder")}
          className="h-11 w-full rounded-xl border border-line bg-field px-4 text-sm text-text-main placeholder:text-text-faint focus:border-success-border focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm text-text-muted">
          <Link className="h-4 w-4" />
          {formsT("jobUrl")}
          <span className="rounded border border-line bg-panel-control/60 px-1.5 py-0.5 text-[10px] text-text-muted">
            {formsT("optional")}
          </span>
        </label>
        <input
          type="url"
          value={jobUrl}
          onChange={(event) => onJobUrlChange(event.target.value)}
          placeholder={formsT("jobUrlPlaceholder")}
          className="h-11 w-full rounded-xl border border-line bg-field px-4 text-sm text-text-main placeholder:text-text-faint focus:border-success-border focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm text-text-muted">
          <Briefcase className="h-4 w-4" />
          {formsT("jobDescription")}
          <span className="rounded border border-danger-border bg-danger-soft px-1.5 py-0.5 text-[10px] text-danger-text">
            {formsT("required")}
          </span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          placeholder={formsT("jobDescriptionPlaceholder")}
          className="h-52 w-full resize-none rounded-xl border border-line bg-field px-4 py-3 text-sm text-text-main placeholder:text-text-faint focus:border-success-border focus:outline-none"
        />
      </div>
    </section>
  );
}
