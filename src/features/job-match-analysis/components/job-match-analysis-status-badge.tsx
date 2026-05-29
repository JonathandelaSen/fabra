"use client";

import { useTranslations } from "next-intl";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import { LabelBadge, LABEL_BADGE_TONES, LABEL_BADGE_SIZES, type LabelBadgeTone } from "@/components/shared/label-badge";

const STATUS_TONES: Record<JobMatchAnalysisOfferStatus, LabelBadgeTone> = {
  interesante: LABEL_BADGE_TONES.INFO,
  aplicado: LABEL_BADGE_TONES.INDIGO,
  entrevista: LABEL_BADGE_TONES.WARNING,
  oferta: LABEL_BADGE_TONES.SUCCESS,
  rechazado: LABEL_BADGE_TONES.DANGER,
  descartado: LABEL_BADGE_TONES.NEUTRAL,
};

interface JobMatchAnalysisStatusBadgeProps {
  status: JobMatchAnalysisOfferStatus;
}

export function JobMatchAnalysisStatusBadge({ status }: JobMatchAnalysisStatusBadgeProps) {
  const navigation = useTranslations("navigation");

  return (
    <LabelBadge
      tone={STATUS_TONES[status]}
      size={LABEL_BADGE_SIZES.XS}
      strong
    >
      {navigation(`offerStatuses.${status}`)}
    </LabelBadge>
  );
}
