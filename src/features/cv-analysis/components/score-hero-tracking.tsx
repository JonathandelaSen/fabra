"use client";

import { useTranslations } from "next-intl";
import { CalendarClock, ChevronDown, Loader2, Check } from "lucide-react";
import { OFFER_STATUSES, type OfferStatus } from "@/lib/analysis-types";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ScoreHeroTrackingProps {
  offerStatus?: OfferStatus | null;
  offerNextAction?: string | null;
  offerNextActionAt?: string | null;
  onTabChange?: (tab: string) => void;
  onOfferStatusChange?: (status: OfferStatus) => Promise<void>;
  isSavingTracking?: boolean;
}

function getStatusStyles(status: OfferStatus) {
  switch (status) {
    case "interesting":
      return {
        bg: "bg-sky-500/10 hover:bg-sky-500/15 border-sky-500/20",
        text: "text-sky-300",
        glow: "",
      };
    case "applied":
      return {
        bg: "bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20",
        text: "text-indigo-300",
        glow: "",
      };
    case "interview":
      return {
        bg: "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20",
        text: "text-amber-300",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse",
      };
    case "offer":
      return {
        bg: "bg-emerald-500/15 hover:bg-emerald-500/20 border-emerald-500/30",
        text: "text-emerald-300 font-bold",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)] border-emerald-500/40",
      };
    case "rejected":
      return {
        bg: "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20",
        text: "text-rose-300",
        glow: "",
      };
    case "discarded":
      return {
        bg: "bg-zinc-500/10 hover:bg-zinc-500/15 border-zinc-500/20",
        text: "text-zinc-400",
        glow: "",
      };
    default:
      return {
        bg: "bg-zinc-500/10 hover:bg-zinc-500/15 border-zinc-500/20",
        text: "text-zinc-400",
        glow: "",
      };
  }
}

export function ScoreHeroTracking({
  offerStatus,
  offerNextAction,
  offerNextActionAt,
  onTabChange,
  onOfferStatusChange,
  isSavingTracking,
}: ScoreHeroTrackingProps) {
  const tTracking = useTranslations("analysisDetail.tracking");
  const navigation = useTranslations("navigation");
  const { locale } = useInterfaceLanguage();
  
  const activeStatus = offerStatus ?? "interesting";
  const statusStyles = getStatusStyles(activeStatus);

  return (
    <div className="w-full md:w-64 shrink-0 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {tTracking("title")}
        </span>
        <button
          onClick={() => onTabChange?.("seguimiento")}
          className="text-[10px] text-zinc-400 hover:text-zinc-200 underline font-medium"
        >
          {locale === "es" ? "Detalles" : "Details"}
        </button>
      </div>

      <div className="space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isSavingTracking}
              className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${statusStyles.bg} ${statusStyles.text} ${statusStyles.glow} disabled:opacity-50`}
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {(activeStatus === "interview" || activeStatus === "offer") && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      activeStatus === "offer" ? "bg-emerald-400" : "bg-amber-400"
                    }`}></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    activeStatus === "offer"
                      ? "bg-emerald-400"
                      : activeStatus === "interview"
                      ? "bg-amber-400"
                      : activeStatus === "applied"
                      ? "bg-indigo-400"
                      : activeStatus === "interesting"
                      ? "bg-sky-400"
                      : activeStatus === "rejected"
                      ? "bg-rose-400"
                      : "bg-zinc-400"
                  }`}></span>
                </span>
                {navigation(`offerStatuses.${activeStatus}`)}
              </span>
              {isSavingTracking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronDown className="w-4.5 h-4.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-300">
            {OFFER_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onOfferStatusChange?.(status)}
                className="flex items-center justify-between px-3 py-2 text-sm hover:bg-zinc-800 hover:text-white rounded-md cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    status === "offer"
                      ? "bg-emerald-400"
                      : status === "interview"
                      ? "bg-amber-400"
                      : status === "applied"
                      ? "bg-indigo-400"
                      : status === "interesting"
                      ? "bg-sky-400"
                      : status === "rejected"
                      ? "bg-rose-400"
                      : "bg-zinc-400"
                  }`} />
                  {navigation(`offerStatuses.${status}`)}
                </span>
                {activeStatus === status && <Check className="w-4 h-4 text-emerald-400" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div
          onClick={() => onTabChange?.("seguimiento")}
          className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/[0.03] transition-colors rounded-xl p-3 cursor-pointer group"
        >
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {tTracking("nextAction")}
            </span>
          </div>
          {offerNextAction ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-200 line-clamp-2">
                {offerNextAction}
              </p>
              {offerNextActionAt && (
                <p className="text-[10px] text-zinc-500">
                  {new Date(offerNextActionAt).toLocaleString(
                    locale === "es" ? "es-ES" : "en-US",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  )}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic group-hover:text-zinc-400 transition-colors">
              {locale === "es" ? "Añadir próxima acción..." : "Add next action..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
