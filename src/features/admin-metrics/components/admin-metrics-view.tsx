"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { MetricsWindowFilter } from "./metrics-window-filter";
import { MetricsGroupSection } from "./metrics-group-section";
import { METRIC_GROUPS } from "../constants";

export function AdminMetricsView() {
  const t = useTranslations("admin.dashboard");
  const [days, setDays] = useState<number | null>(null);

  return (
    <FeatureScreenShell title={t("title")}>
      <div className="space-y-8">
        <MetricsWindowFilter days={days} onChange={setDays} />
        
        <div className="space-y-8">
          {METRIC_GROUPS.map((group) => (
            <MetricsGroupSection key={group} group={group} days={days} />
          ))}
        </div>
      </div>
    </FeatureScreenShell>
  );
}
