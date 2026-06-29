"use client";

import { useTranslations } from "next-intl";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import { LabelBadge, LABEL_BADGE_TONES, LABEL_BADGE_SIZES, type LabelBadgeTone, type LabelBadgeSize } from "@/frontend/components/shared/label-badge";

const STATUS_TONES: Record<JobMatchAnalysisOfferStatus, LabelBadgeTone> = {
  interesting: LABEL_BADGE_TONES.INFO,
  applied: LABEL_BADGE_TONES.INDIGO,
  interview: LABEL_BADGE_TONES.WARNING,
  offer: LABEL_BADGE_TONES.SUCCESS,
  rejected: LABEL_BADGE_TONES.DANGER,
  discarded: LABEL_BADGE_TONES.NEUTRAL,
};

const DOT_COLORS: Record<JobMatchAnalysisOfferStatus, string> = {
  interesting: "bg-info",
  applied: "bg-action",
  interview: "bg-warning",
  offer: "bg-success",
  rejected: "bg-danger",
  discarded: "bg-text-muted",
};

const PING_COLORS: Record<JobMatchAnalysisOfferStatus, string | null> = {
  interesting: null,
  applied: null,
  interview: "bg-warning",
  offer: "bg-success",
  rejected: null,
  discarded: null,
};

interface JobMatchAnalysisStatusBadgeProps {
  status: JobMatchAnalysisOfferStatus;
  size?: LabelBadgeSize;
  className?: string;
  showDot?: boolean;
}

export function JobMatchAnalysisStatusBadge({
  status,
  size = LABEL_BADGE_SIZES.XS,
  className,
  showDot = false,
}: JobMatchAnalysisStatusBadgeProps) {
  const navigation = useTranslations("navigation");

  const dotBg = DOT_COLORS[status];
  const pingBg = PING_COLORS[status];

  return (
    <LabelBadge
      tone={STATUS_TONES[status]}
      size={size}
      strong
      className={className}
    >
      <span className="flex items-center gap-1.5">
        {showDot && (
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            {pingBg && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pingBg}`} />
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotBg}`} />
          </span>
        )}
        <span>{navigation(`offerStatuses.${status}`)}</span>
      </span>
    </LabelBadge>
  );
}
