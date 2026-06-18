"use client";

import { motion } from "framer-motion";
import { CalendarClock, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { OFFER_STATUSES, type OfferStatus } from "@/lib/analysis-types";

interface TabFollowUpProps {
  offerStatus: OfferStatus;
  onOfferStatusChange: (status: OfferStatus) => void;
  offerNotes: string;
  onOfferNotesChange: (notes: string) => void;
  offerNextAction: string;
  onOfferNextActionChange: (action: string) => void;
  offerNextActionAt: string;
  onOfferNextActionAtChange: (date: string) => void;
  isSavingTracking: boolean;
  onSaveTracking: () => void;
}

export default function TabFollowUp({
  offerStatus,
  onOfferStatusChange,
  offerNotes,
  onOfferNotesChange,
  offerNextAction,
  onOfferNextActionChange,
  offerNextActionAt,
  onOfferNextActionAtChange,
  isSavingTracking,
  onSaveTracking,
}: TabFollowUpProps) {
  const t = useTranslations("analysisDetail.tracking");
  const common = useTranslations("common.actions");
  const navigation = useTranslations("navigation");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <section className="rounded-2xl border border-success-border bg-success/[0.025] p-5 max-w-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-success-border bg-success/10 text-success-text">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-success-text">
                {t("title")}
              </h4>
              <p className="text-xs text-text-muted">{t("description")}</p>
            </div>
          </div>
          <button
            onClick={onSaveTracking}
            disabled={isSavingTracking}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-success-border bg-success/10 px-3 text-xs font-semibold text-success-text transition-colors hover:bg-success/20 disabled:opacity-50"
          >
            {isSavingTracking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {isSavingTracking ? common("saving") : common("save")}
          </button>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">
                {t("status")}
              </span>
              <select
                value={offerStatus}
                onChange={(event) =>
                  onOfferStatusChange(event.target.value as OfferStatus)
                }
                className="h-10 w-full rounded-lg border border-line bg-field px-3 text-sm text-text-main focus:border-success-border focus:outline-none focus:ring-1 focus:ring-success-border"
              >
                {OFFER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {navigation(`offerStatuses.${status}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">
                {t("date")}
              </span>
              <input
                type="datetime-local"
                value={offerNextActionAt}
                onChange={(event) =>
                  onOfferNextActionAtChange(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-line bg-field px-3 text-sm text-text-main focus:border-success-border focus:outline-none focus:ring-1 focus:ring-success-border"
              />
            </label>
          </div>
          <label className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">
              {t("nextAction")}
            </span>
            <input
              type="text"
              value={offerNextAction}
              onChange={(event) => onOfferNextActionChange(event.target.value)}
              placeholder={t("nextActionPlaceholder")}
              className="h-10 w-full rounded-lg border border-line bg-field px-3 text-sm text-text-main placeholder:text-text-faint focus:border-success-border focus:outline-none focus:ring-1 focus:ring-success-border"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">
              {t("note")}
            </span>
            <textarea
              value={offerNotes}
              onChange={(event) => onOfferNotesChange(event.target.value)}
              placeholder={t("notePlaceholder")}
              rows={7}
              className="w-full resize-none rounded-lg border border-line bg-field px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-success-border focus:outline-none focus:ring-1 focus:ring-success-border"
            />
          </label>
        </div>
      </section>
    </motion.div>
  );
}
