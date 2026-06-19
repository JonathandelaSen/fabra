"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Trash2 } from "lucide-react";
import { deleteAccount, type AuthFormState } from "@/app/login/actions";
import { DeleteButton } from "@/frontend/components/shared/action-buttons";
import { AlertBanner, ALERT_BANNER_TONES } from "@/frontend/components/shared/alert-banner";
import { useInterfaceLanguage } from "@/frontend/components/shared/i18n-provider";
import { isValidEmail, isValidPassword } from "@/frontend/utils/auth-validation";

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
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const isEmailValid = isValidEmail(emailValue);
  const isPasswordValid = isValidPassword(passwordValue);
  const isFormValid = isEmailValid && isPasswordValid;

  return (
    <form
      action={deleteAction}
      className="rounded-2xl border border-danger-border bg-danger-soft p-6"
    >
      <input type="hidden" name="interfaceLanguage" value={locale} />
      <div className="mb-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-danger-text">
          <Trash2 className="h-4 w-4" />
          {t("deleteAccount")}
        </p>
        <p className="mt-1 text-xs leading-5 text-danger-text/70">
          {t("deleteWarning")}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="emailConfirmation"
          type="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          autoComplete="email"
          placeholder={userEmail || t("accountEmail")}
          required
          className="h-11 rounded-xl border border-danger-border bg-field px-4 text-sm text-text-main outline-none transition-all placeholder:text-text-faint focus:border-danger-border focus:ring-2 focus:ring-danger-border"
        />
        <input
          name="password"
          type="password"
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          autoComplete="current-password"
          placeholder={t("currentPassword")}
          required
          className="h-11 rounded-xl border border-danger-border bg-field px-4 text-sm text-text-main outline-none transition-all placeholder:text-text-faint focus:border-danger-border focus:ring-2 focus:ring-danger-border"
        />
      </div>

      {deleteState.error && (
        <AlertBanner tone={ALERT_BANNER_TONES.DANGER} icon={AlertCircle} className="mt-3">
          {deleteState.error}
        </AlertBanner>
      )}

      <DeleteButton
        type="submit"
        loading={deletePending}
        disabled={deletePending || !isFormValid}
        strong
        className="mt-4 h-10"
      >
        {t("deleteForever")}
      </DeleteButton>
    </form>
  );
}
