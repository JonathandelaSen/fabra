"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Activity, Users, LayoutDashboard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminObservabilityView } from "@/features/admin-observability";
import { AdminUsersView } from "@/features/admin-users";
import { AdminMetricsView } from "@/features/admin-metrics";

type AdminSection = "dashboard" | "users" | "observability";

interface AdminAreaViewProps {
  userEmail: string | null;
}

export function AdminAreaView({ userEmail }: AdminAreaViewProps) {
  const t = useTranslations("admin.sections");
  const router = useRouter();
  const pathname = usePathname();

  let section: AdminSection = "dashboard";
  if (pathname.startsWith("/admin/users")) {
    section = "users";
  } else if (pathname.startsWith("/admin/observability")) {
    section = "observability";
  }

  const handleTabChange = (value: string | number | null) => {
    if (value && typeof value === "string") {
      router.push(`/admin/${value}`);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="shrink-0 border-b border-line bg-canvas-header px-5 py-2.5">
        <Tabs value={section} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="dashboard">
              <LayoutDashboard />
              {t("dashboard")}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users />
              {t("users")}
            </TabsTrigger>
            <TabsTrigger value="observability">
              <Activity />
              {t("observability")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
