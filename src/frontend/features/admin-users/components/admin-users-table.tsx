"use client";

import { useTranslations } from "next-intl";
import { UserRound } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { DeleteButton } from "@/frontend/components/shared/action-buttons";
import { LabelBadge, LABEL_BADGE_SIZES } from "@/frontend/components/shared/label-badge";
import type { AdminUserResponse } from "@/app/api/admin/users/responses";

interface AdminUsersTableProps {
  users: AdminUserResponse[];
  currentUserEmail: string | null;
  dateLocale: string;
  impersonating: boolean;
  onImpersonate: (user: AdminUserResponse) => void;
  onDelete: (user: AdminUserResponse) => void;
}

export function AdminUsersTable({
  users,
  currentUserEmail,
  dateLocale,
  impersonating,
  onImpersonate,
  onDelete,
}: AdminUsersTableProps) {
  const t = useTranslations("admin.users");

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-panel-subtle text-left text-xs uppercase tracking-wide text-text-muted">
        <tr className="border-b border-line">
          <th className="px-4 py-3 font-medium">{t("emailColumn")}</th>
          <th className="px-4 py-3 font-medium">{t("createdColumn")}</th>
          <th className="px-4 py-3 font-medium text-right">
            {t("actionsColumn")}
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const isSelf =
            currentUserEmail !== null && user.email === currentUserEmail;

          return (
            <tr
              key={user.id}
              className="border-b border-line/60 last:border-b-0 hover:bg-panel-active/40"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-text-main">
                  <span className="truncate">{user.email}</span>
                  {isSelf && (
                    <LabelBadge
                      size={LABEL_BADGE_SIZES.XS}
                      label={t("youBadge")}
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-text-muted">
                {new Date(user.createdAt).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSelf || impersonating}
                    onClick={() => onImpersonate(user)}
                  >
                    <UserRound className="h-4.5 w-4.5" />
                    {t("becomeUser")}
                  </Button>
                  <DeleteButton
                    disabled={isSelf || impersonating}
                    onClick={() => onDelete(user)}
                    aria-label={t("deleteUser")}
                    title={t("deleteUser")}
                  />
                </div>
              </td>

            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
