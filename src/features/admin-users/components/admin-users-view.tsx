"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Loader2, Search, UserRound, Users } from "lucide-react";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminUserResponse } from "@/app/api/admin/users/responses";
import { useAdminUsersQuery } from "../hooks/use-admin-users-query";
import { useImpersonateUser } from "../hooks/use-impersonate-user";
import { useDeleteAdminUser } from "../hooks/use-delete-admin-user";
import { AdminUsersTable } from "./admin-users-table";

interface AdminUsersViewProps {
  userEmail: string | null;
}

export function AdminUsersView({ userEmail }: AdminUsersViewProps) {
  const t = useTranslations("admin.users");
  const { locale } = useInterfaceLanguage();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingUser, setPendingUser] = useState<AdminUserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserResponse | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const usersQuery = useAdminUsersQuery({ search, page });
  const impersonation = useImpersonateUser();
  const deleteMutation = useDeleteAdminUser();


  const users = usersQuery.data?.users ?? [];
  const total = usersQuery.data?.total ?? 0;
  const perPage = usersQuery.data?.perPage ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const queryError =
    usersQuery.error instanceof Error ? usersQuery.error.message : null;
  const impersonationError =
    impersonation.error instanceof Error ? impersonation.error.message : null;
  const deleteError =
    deleteMutation.error instanceof Error ? deleteMutation.error.message : null;

  return (
    <FeatureScreenShell
      title={t("title")}
      bodyClassName="overflow-hidden"
    >
      <section className="flex h-full min-h-0 flex-col gap-4">
        <div className="relative max-w-md shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>

        {queryError && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>{queryError}</AlertBanner>
        )}
        {impersonationError && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
            {impersonationError}
          </AlertBanner>
        )}
        {deleteError && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
            {deleteError}
          </AlertBanner>
        )}
        {deleteMutation.isSuccess && (
          <AlertBanner tone={ALERT_BANNER_TONES.SUCCESS}>
            {t("deleteUserSuccess")}
          </AlertBanner>
        )}


        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-line bg-panel-subtle">
          {usersQuery.isLoading ? (
            <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-text-muted">
              {t("loading")}
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-center text-text-muted">
              <Users className="h-7 w-7" />
              <p className="text-sm">{t("empty")}</p>
            </div>
          ) : (
            <AdminUsersTable
              users={users}
              currentUserEmail={userEmail}
              dateLocale={dateLocale}
              impersonating={impersonation.isPending || deleteMutation.isPending}
              onImpersonate={setPendingUser}
              onDelete={setDeletingUser}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between text-sm text-text-muted">
          <span>{t("pageOf", { page, totalPages, total })}</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || usersQuery.isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("previous")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || usersQuery.isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={pendingUser !== null}
        variant="default"
        headerTitle={t("confirmHeader")}
        title={t("confirmTitle", { email: pendingUser?.email ?? "" })}
        description={t("confirmDescription")}
        confirmLabel={t("becomeUser")}
        onConfirm={() => {
          if (pendingUser) {
            impersonation.mutate(pendingUser.id);
          }
          setPendingUser(null);
        }}
        onCancel={() => setPendingUser(null)}
      />

      <ConfirmDialog
        open={deletingUser !== null}
        variant="danger"
        headerTitle={t("deleteUserConfirmHeader")}
        title={t("deleteUserConfirmTitle", { email: deletingUser?.email ?? "" })}
        description={t("deleteUserConfirmDescription")}
        confirmLabel={t("deleteUser")}
        onConfirm={() => {
          if (deletingUser) {
            deleteMutation.mutate(deletingUser.id);
          }
          setDeletingUser(null);
        }}
        onCancel={() => setDeletingUser(null)}
      />

      {impersonation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-modal px-5 py-4 text-sm text-text-main">
            <UserRound className="h-4 w-4 animate-pulse" />
            {t("startingImpersonation")}
          </div>
        </div>
      )}

      {deleteMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-modal px-5 py-4 text-sm text-text-main">
            <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
            {t("deletingUser")}
          </div>
        </div>
      )}
    </FeatureScreenShell>
  );
}
