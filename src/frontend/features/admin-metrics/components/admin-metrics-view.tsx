import { useState } from "react";
import { useTranslations } from "next-intl";
import { FeatureScreenShell } from "@/frontend/components/shared/feature-screen-shell";
import { MetricsWindowFilter } from "./metrics-window-filter";
import { MetricsGroupSection } from "./metrics-group-section";
import { METRIC_GROUPS } from "../constants";
import { Activity } from "lucide-react";

export function AdminMetricsView() {
  const t = useTranslations("admin.dashboard");
  const [days, setDays] = useState<number | null>(null);

  return (
    <FeatureScreenShell 
      title={t("title")}
      bodyClassName="overflow-y-auto"
      bodyContentClassName="h-auto"
    >
      <div className="space-y-6 pb-12">
        <div className="flex justify-end">
          <MetricsWindowFilter days={days} onChange={setDays} />
        </div>

        <div className="space-y-6">
          {METRIC_GROUPS.map((group) => (
            <MetricsGroupSection key={group} group={group} days={days} />
          ))}
        </div>
      </div>
    </FeatureScreenShell>
  );
}
