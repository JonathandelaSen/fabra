import { useTranslations } from "next-intl";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "./metric-card";
import { useGroupMetrics } from "../hooks/use-admin-metrics-queries";
import type { MetricGroup } from "../constants";
import {
  FolderOpen,
  LineChart,
  Briefcase,
  MessageSquare,
  Layers,
} from "lucide-react";

interface MetricsGroupSectionProps {
  group: MetricGroup;
  days: number | null;
}

// Map group keys to icons
const GROUP_META: Record<
  MetricGroup,
  {
    icon: React.ComponentType<any>;
  }
> = {
  cv: {
    icon: FolderOpen,
  },
  analysis: {
    icon: LineChart,
  },
  opportunities: {
    icon: Briefcase,
  },
  feedback: {
    icon: MessageSquare,
  },
  workspace: {
    icon: Layers,
  },
};

export function MetricsGroupSection({ group, days }: MetricsGroupSectionProps) {
  const t = useTranslations("admin.dashboard");
  const { totalQuery, windowQuery } = useGroupMetrics(group, days);

  const meta = GROUP_META[group];
  const GroupIcon = meta.icon;

  if (totalQuery.error || windowQuery.error) {
    return (
      <div className="space-y-4 py-2 border-b border-line/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
            <GroupIcon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-text-main">
            {t(`groups.${group}`)}
          </h3>
        </div>
        <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>{t("errors.load")}</AlertBanner>
      </div>
    );
  }

  const isLoadingTotal = totalQuery.isLoading;
  const isLoadingWindow = days !== null && windowQuery.isLoading;
  
  const keys = totalQuery.data?.counts ? Object.keys(totalQuery.data.counts) : [];

  return (
    <div className="space-y-4 py-2 border-b border-line/40 pb-6 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-foreground/5 text-muted-foreground">
            <GroupIcon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-text-main">
            {t(`groups.${group}`)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {isLoadingTotal ? (
          <>
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
          </>
        ) : (
          keys.map((key) => {
            const total = totalQuery.data?.counts[key];
            const windowCount = windowQuery.data?.counts?.[key];
            const label = t.has(`metrics.${key}`) ? t(`metrics.${key}`) : key;
            return (
              <MetricCard
                key={key}
                metricKey={key}
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
