"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/lib/clipboard";
import {
  Activity,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import type { ProcessingEventResponse } from "@/app/api/admin/processing-events/responses";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import {
  ObservabilityDetailSkeleton,
  ObservabilityListSkeleton,
} from "./observability-skeleton";
import { useProcessingEventsQuery } from "../hooks/use-admin-observability-queries";
import { useAdminObservabilityRouteState } from "../hooks/use-admin-observability-route-state";
import { ObservabilityFilters } from "./observability-filters";
import { ObservabilityEventItem } from "./observability-event-item";
import { ObservabilityEventDetail } from "./observability-event-detail";

interface AdminObservabilityViewProps {
  userEmail: string | null;
}

export function AdminObservabilityView({
  userEmail,
}: AdminObservabilityViewProps) {
  const t = useTranslations("admin");
  const { locale } = useInterfaceLanguage();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const { filters, setStatus, setStage } = useAdminObservabilityRouteState();
  const eventsQuery = useProcessingEventsQuery(filters);
  const events = eventsQuery.data?.events ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const loading = eventsQuery.isLoading;
  const error =
    eventsQuery.error instanceof Error
      ? eventsQuery.error.message
      : eventsQuery.error
        ? t("errors.unexpected")
        : null;

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? events[0] ?? null,
    [events, selectedId],
  );

  const handleCopy = async (event: ProcessingEventResponse) => {
    try {
      await copyToClipboard(JSON.stringify(event, null, 2));
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyTimeline = () => {
    void copyToClipboard(
      JSON.stringify(timelineEvents, null, 2),
    );
    setCopiedId("timeline");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const timelineEvents = useMemo(() => {
    if (!selectedEvent) return [];
    const related = events.filter((event) => {
      if (selectedEvent.requestId) {
        return event.requestId === selectedEvent.requestId;
      }
      if (selectedEvent.analysisId) {
        return event.analysisId === selectedEvent.analysisId;
      }
      return event.cvId && event.cvId === selectedEvent.cvId;
    });

    return related.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [events, selectedEvent]);

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return events;

    return events.filter((event) =>
      [
        event.requestId,
        event.cvId,
        event.analysisId,
        event.stage,
        event.source,
        event.errorCode,
        event.errorMessage,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [events, query]);

  useEffect(() => {
    setSelectedId((current) => {
      if (current && events.some((event) => event.id === current)) {
        return current;
      }
      return events[0]?.id ?? null;
    });
  }, [events]);

  return (
    <FeatureScreenShell
      title={
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {userEmail ?? t("adminFallback")}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {t("title")}
          </h1>
        </div>
      }
      actions={
        <button
          type="button"
          onClick={() => void eventsQuery.refetch()}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-3 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-60"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      }
      bodyClassName="overflow-hidden"
    >
      <section className="grid min-h-0 h-full gap-4 lg:grid-cols-[420px_1fr]">
          <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <ObservabilityFilters
              filters={filters}
              onStatusChange={setStatus}
              onStageChange={setStage}
              query={query}
              onQueryChange={setQuery}
            />

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {error && (
                <AlertBanner tone={ALERT_BANNER_TONES.DANGER} className="mb-2">
                  {error}
                </AlertBanner>
              )}
              {loading ? (
                <ObservabilityListSkeleton />
              ) : filteredEvents.length === 0 ? (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-center text-zinc-500">
                  <Activity className="h-7 w-7" />
                  <p className="text-sm">{t("empty")}</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <ObservabilityEventItem
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent?.id === event.id}
                    onClick={() => setSelectedId(event.id)}
                    dateLocale={dateLocale}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="min-h-[520px] overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
            {loading ? (
              <ObservabilityDetailSkeleton />
            ) : selectedEvent ? (
              <ObservabilityEventDetail
                selectedEvent={selectedEvent}
                timelineEvents={timelineEvents}
                copiedId={copiedId}
                onCopy={handleCopy}
                onCopyTimeline={handleCopyTimeline}
                dateLocale={dateLocale}
              />
            ) : (
              <div className="flex h-full min-h-[520px] items-center justify-center text-sm text-zinc-500">
                {t("selectEvent")}
              </div>
            )}
          </section>
      </section>
    </FeatureScreenShell>
  );
}
