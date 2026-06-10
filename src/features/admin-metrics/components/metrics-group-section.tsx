import { useTranslations } from "next-intl";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "./metric-card";
import { useGroupMetrics } from "../hooks/use-admin-metrics-queries";
import type { MetricGroup } from "../constants";

interface MetricsGroupSectionProps {
  group: MetricGroup;
  days: number | null;
}

export function MetricsGroupSection({ group, days }: MetricsGroupSectionProps) {
  const t = useTranslations("admin.dashboard");
  const { totalQuery, windowQuery } = useGroupMetrics<{
    counts: Record<string, number>;
  }>(group, days);

  if (totalQuery.error || windowQuery.error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t(`groups.${group}`)}</h3>
        <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>{t("errors.load")}</AlertBanner>
      </div>
    );
  }

  const isLoadingTotal = totalQuery.isLoading;
  const isLoadingWindow = days !== null && windowQuery.isLoading;
  
  const keys = totalQuery.data?.counts ? Object.keys(totalQuery.data.counts) : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t(`groups.${group}`)}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoadingTotal ? (
          <>
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </>
        ) : (
          keys.map((key) => {
            const total = totalQuery.data?.counts[key];
            const windowCount = windowQuery.data?.counts?.[key];
            const label = t.has(`metrics.${key}`) ? t(`metrics.${key}`) : key;
            return (
              <MetricCard
                key={key}
                label={label}
                total={total}
                windowCount={isLoadingWindow ? undefined : windowCount}
                windowDays={days}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
