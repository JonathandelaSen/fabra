"use client";

import { useTranslations } from "next-intl";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import { LabelBadge, LABEL_BADGE_TONES, LABEL_BADGE_SIZES, type LabelBadgeTone } from "@/frontend/components/shared/label-badge";

const STATUS_TONES: Record<JobMatchAnalysisOfferStatus, LabelBadgeTone> = {
  interesting: LABEL_BADGE_TONES.INFO,
  applied: LABEL_BADGE_TONES.INDIGO,
  interview: LABEL_BADGE_TONES.WARNING,
  offer: LABEL_BADGE_TONES.SUCCESS,
  rejected: LABEL_BADGE_TONES.DANGER,
  discarded: LABEL_BADGE_TONES.NEUTRAL,
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
