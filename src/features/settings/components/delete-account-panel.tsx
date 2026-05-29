"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Trash2 } from "lucide-react";
import { deleteAccount, type AuthFormState } from "@/app/login/actions";
import { DeleteButton } from "@/components/shared/action-buttons";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";

const INITIAL_STATE: AuthFormState = {};

interface DeleteAccountPanelProps {
  userEmail: string | null;
}

export function DeleteAccountPanel({ userEmail }: DeleteAccountPanelProps) {
  const t = useTranslations("settings.account");
  const { locale } = useInterfaceLanguage();
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccount,
    INITIAL_STATE,
  );

  return (
    <form
      action={deleteAction}
      className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-6"
    >
      <input type="hidden" name="interfaceLanguage" value={locale} />
      <div className="mb-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-rose-100">
          <Trash2 className="h-4 w-4" />
          {t("deleteAccount")}
        </p>
        <p className="mt-1 text-xs leading-5 text-rose-100/70">
          {t("deleteWarning")}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="emailConfirmation"
          type="email"
          autoComplete="email"
          placeholder={userEmail || t("accountEmail")}
          required
          className="h-11 rounded-xl border border-rose-500/20 bg-[#0a0a12] px-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-rose-400/40 focus:ring-2 focus:ring-rose-500/10"
        />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("currentPassword")}
          required
          className="h-11 rounded-xl border border-rose-500/20 bg-[#0a0a12] px-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-rose-400/40 focus:ring-2 focus:ring-rose-500/10"
        />
      </div>

      {deleteState.error && (
        <div className="mt-3 flex gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{deleteState.error}</span>
        </div>
      )}

      <DeleteButton
        type="submit"
        loading={deletePending}
        strong
        className="mt-4 h-10"
      >
        {t("deleteForever")}
      </DeleteButton>
    </form>
  );
}
