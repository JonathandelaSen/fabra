"use client";

import { useTranslations } from "next-intl";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";

const OFFER_STATUS_BADGE_CLASS: Record<JobMatchAnalysisOfferStatus, string> = {
  interesante: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  aplicado: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
  entrevista: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  oferta: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  rechazado: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  descartado: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

interface JobMatchAnalysisStatusBadgeProps {
  status: JobMatchAnalysisOfferStatus;
}

export function JobMatchAnalysisStatusBadge({ status }: JobMatchAnalysisStatusBadgeProps) {
  const navigation = useTranslations("navigation");

  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${OFFER_STATUS_BADGE_CLASS[status]}`}
    >
      {navigation(`offerStatuses.${status}`)}
    </span>
  );
}
