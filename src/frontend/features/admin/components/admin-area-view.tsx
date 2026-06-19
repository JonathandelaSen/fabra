"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Users, LayoutDashboard, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { AdminUsersView } from "@/frontend/features/admin-users";
import { AdminMetricsView } from "@/frontend/features/admin-metrics";
import { AdminAIInteractionsView } from "@/frontend/features/admin-ai-interactions";

type AdminSection = "dashboard" | "users" | "ai-interactions";

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
  } else if (pathname.startsWith("/admin/ai-interactions")) {
    section = "ai-interactions";
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
              <TabsTrigger value="ai-interactions">
                <Sparkles />
                {t("aiInteractions")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {section === "dashboard" ? (
          <AdminMetricsView />
        ) : section === "users" ? (
          <AdminUsersView userEmail={userEmail} />
        ) : (
          <AdminAIInteractionsView />
        )}
      </div>
    </div>
  );
}
