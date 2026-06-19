"use client";

import { useTranslations } from "next-intl";
import { type OfferStatus } from "@/lib/analysis-types";
import { type DetailTab } from "../../types";

export const STATUS_CONFIG: Record<
  OfferStatus,
  { readonly bg: string; readonly dotBg: string; readonly pingBg: string | null }
> = {
  interesting: {
    bg: "bg-info/15 border-info-border/30 text-info-text hover:bg-info/25 shadow-[var(--ui-status-info-shadow)]",
    dotBg: "bg-info",
    pingBg: null,
  },
  applied: {
    bg: "bg-action/15 border-action-border/30 text-action-text hover:bg-action/25 shadow-[var(--ui-status-action-shadow)]",
    dotBg: "bg-action",
    pingBg: null,
  },
  interview: {
    bg: "bg-warning/15 border-warning-border text-warning-text hover:bg-warning/25 shadow-[var(--ui-status-warning-shadow)] animate-pulse",
    dotBg: "bg-warning",
    pingBg: "bg-warning",
  },
  offer: {
    bg: "bg-success/15 border-success-border text-success-text hover:bg-success/25 shadow-[var(--ui-status-success-shadow)] font-semibold",
    dotBg: "bg-success",
    pingBg: "bg-success",
  },
  rejected: {
    bg: "bg-danger-soft border-danger-border text-danger-text hover:bg-danger-soft",
    dotBg: "bg-danger",
    pingBg: null,
  },
  discarded: {
    bg: "bg-panel-control/15 border-line-default text-text-muted hover:bg-panel-control/25",
    dotBg: "bg-text-muted",
    pingBg: null,
  },
} as const;

interface ScoreHeroOfferStatusBadgeProps {
  offerStatus?: OfferStatus | null;
  onTabChange?: (tab: DetailTab) => void;
  tabValue: DetailTab;
}

export function ScoreHeroOfferStatusBadge({
  offerStatus,
  onTabChange,
  tabValue,
}: ScoreHeroOfferStatusBadgeProps) {
  const navigation = useTranslations("navigation");
  const tTracking = useTranslations("analysisDetail.tracking");

  const activeStatus: OfferStatus = offerStatus ?? "interesting";
  const config = STATUS_CONFIG[activeStatus];

  return (
    <button
      onClick={() => onTabChange?.(tabValue)}
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all duration-300 hover:scale-[1.03] ${config.bg}`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {config.pingBg && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pingBg}`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotBg}`} />
      </span>
      <span className="text-text-muted/80 font-medium text-[10px] uppercase tracking-wider">
        {tTracking("status")}:
      </span>
      <span>
        {navigation(`offerStatuses.${activeStatus}`)}
      </span>
    </button>
  );
}
