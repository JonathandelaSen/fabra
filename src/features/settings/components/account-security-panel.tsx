"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, Loader2, LockKeyhole, LogOut, Save, UserX } from "lucide-react";
import {
  changePasswordWithCurrent,
  signOut,
  type AuthFormState,
} from "@/app/login/actions";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";

const INITIAL_STATE: AuthFormState = {};

export function AccountSecurityPanel() {
  const t = useTranslations("settings.account");
  const { locale } = useInterfaceLanguage();
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePasswordWithCurrent,
    INITIAL_STATE,
  );

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          <UserX className="h-5 w-5 text-zinc-400" />
          {t("title")}
        </h2>
      </div>

      <div className="space-y-5">
        <form
          action={signOut}
          className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#0a0a12] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <input type="hidden" name="interfaceLanguage" value={locale} />
          <div>
            <p className="text-sm font-medium text-zinc-200">
              {t("signOut")}
            </p>
          </div>
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-semibold text-zinc-200 transition-all hover:bg-white/[0.07] active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </button>
        </form>

        <form
          action={passwordAction}
          className="rounded-xl border border-white/[0.06] bg-[#0a0a12] p-4"
        >
          <input type="hidden" name="interfaceLanguage" value={locale} />
          <div className="mb-4">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <LockKeyhole className="h-4 w-4 text-indigo-300" />
              {t("changePassword")}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder={t("currentPassword")}
              required
              className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
            />
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={t("newPassword")}
              minLength={6}
              required
              className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
            />
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t("repeatNewPassword")}
              minLength={6}
              required
              className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          {(passwordState.error || passwordState.message) && (
            <div
              className={`mt-3 flex gap-2 rounded-xl border px-3 py-2 text-sm ${
                passwordState.error
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {passwordState.error ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{passwordState.error || passwordState.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
