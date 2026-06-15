"use client";

import { useTranslations } from "next-intl";
import { type OfferStatus } from "@/lib/analysis-types";
import { type DetailTab } from "../../types";

export const STATUS_CONFIG: Record<
  OfferStatus,
  { readonly bg: string; readonly dotBg: string; readonly pingBg: string | null }
> = {
  interesting: {
    bg: "bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25 shadow-[0_0_8px_rgba(14,165,233,0.1)]",
    dotBg: "bg-sky-400",
    pingBg: null,
  },
  applied: {
    bg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 shadow-[0_0_8px_rgba(99,102,241,0.1)]",
    dotBg: "bg-indigo-400",
    pingBg: null,
  },
  interview: {
    bg: "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse",
    dotBg: "bg-amber-400",
    pingBg: "bg-amber-400",
  },
  offer: {
    bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-semibold",
    dotBg: "bg-emerald-400",
    pingBg: "bg-emerald-400",
  },
  rejected: {
    bg: "bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25",
    dotBg: "bg-rose-400",
    pingBg: null,
  },
  discarded: {
    bg: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/25",
    dotBg: "bg-zinc-400",
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
      <span className="text-zinc-400/80 font-medium text-[10px] uppercase tracking-wider">
        {tTracking("status")}:
      </span>
      <span>
        {navigation(`offerStatuses.${activeStatus}`)}
      </span>
    </button>
  );
}
