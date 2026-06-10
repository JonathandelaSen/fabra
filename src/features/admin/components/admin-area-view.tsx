"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Activity, Users, LayoutDashboard } from "lucide-react";
import { FeatureDetailTabBar } from "@/components/shared/feature-detail-tab-bar";
import { AdminObservabilityView } from "@/features/admin-observability";
import { AdminUsersView } from "@/features/admin-users";
import { AdminMetricsView } from "@/features/admin-metrics";

type AdminSection = "dashboard" | "users" | "observability";

interface AdminAreaViewProps {
  userEmail: string | null;
}

export function AdminAreaView({ userEmail }: AdminAreaViewProps) {
  const t = useTranslations("admin.sections");
  const [section, setSection] = useState<AdminSection>("dashboard");

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="shrink-0 border-b border-line bg-canvas-header px-5 py-1.5">
        <FeatureDetailTabBar<AdminSection>
          tabs={[
            {
              id: "dashboard",
              label: t("dashboard"),
              icon: <LayoutDashboard className="h-4 w-4" />,
            },
            {
              id: "users",
              label: t("users"),
              icon: <Users className="h-4 w-4" />,
            },
            {
              id: "observability",
              label: t("observability"),
              icon: <Activity className="h-4 w-4" />,
            },
          ]}
          activeTab={section}
          onTabChange={setSection}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {section === "dashboard" ? (
          <AdminMetricsView />
        ) : section === "users" ? (
          <AdminUsersView userEmail={userEmail} />
        ) : (
          <AdminObservabilityView userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}
