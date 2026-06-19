"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Palette, Pencil, Sparkles } from "lucide-react";

interface AnalysisNextStepProps {
  cvId: string | null;
  isTemplateCv: boolean;
}

export function AnalysisNextStep({ cvId, isTemplateCv }: AnalysisNextStepProps) {
  const t = useTranslations("analysisDetail.nextStep");

  if (!cvId) return null;

  const href = isTemplateCv
    ? `/cvs/editor/${encodeURIComponent(cvId)}`
    : `/templates?cvId=${encodeURIComponent(cvId)}`;

  const ActionIcon = isTemplateCv ? Pencil : Palette;
  const title = isTemplateCv ? t("templateTitle") : t("uploadedTitle");
  const description = isTemplateCv
    ? t("templateDescription")
    : t("uploadedDescription");
  const cta = isTemplateCv ? t("templateCta") : t("uploadedCta");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-success-border bg-gradient-to-r from-success-soft to-info-soft p-5">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-success/15 border border-success-border text-success-text">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-success-text/80">
            {t("eyebrow")}
          </p>
          <h4 className="text-base font-bold text-text-main">{title}</h4>
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex flex-shrink-0 items-center justify-center gap-2 text-sm font-semibold text-text-on-bright bg-success hover:bg-success px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[var(--ui-success-shadow)]"
      >
        <ActionIcon className="w-4 h-4" />
        {cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
