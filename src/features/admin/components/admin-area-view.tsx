"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Users, LayoutDashboard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsersView } from "@/features/admin-users";
import { AdminMetricsView } from "@/features/admin-metrics";

type AdminSection = "dashboard" | "users";

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
  }

  const handleTabChange = (value: string | number | null) => {
    if (value && typeof value === "string") {
      router.push(`/admin/${value}`);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="shrink-0 border-b border-line bg-canvas-header px-4 lg:px-5 xl:px-6 py-2.5">
        <div className="mx-auto w-full max-w-[1560px]">
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
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {section === "dashboard" ? (
          <AdminMetricsView />
        ) : (
          <AdminUsersView userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}
