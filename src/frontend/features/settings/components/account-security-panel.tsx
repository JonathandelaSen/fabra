"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, LockKeyhole, Save, UserX } from "lucide-react";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { SettingsSectionPanel } from "@/components/shared/settings-section-panel";
import { SignOutButton } from "./sign-out-button";
import {
  changePasswordWithCurrent,
  signOut,
  type AuthFormState,
} from "@/app/login/actions";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { isValidPassword } from "@/frontend/auth-validation";

const INITIAL_STATE: AuthFormState = {};

export function AccountSecurityPanel() {
  const t = useTranslations("settings.account");
  const { locale } = useInterfaceLanguage();
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePasswordWithCurrent,
    INITIAL_STATE,
  );
  const [currentPasswordValue, setCurrentPasswordValue] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  const isFormValid =
    isValidPassword(currentPasswordValue) &&
    isValidPassword(newPasswordValue) &&
    isValidPassword(confirmPasswordValue);

  return (
    <SettingsSectionPanel title={t("title")} icon={UserX}>
      <div className="space-y-5">
        <form
          action={signOut}
          className="flex flex-col gap-3 rounded-xl border border-line bg-panel-elevated p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <input type="hidden" name="interfaceLanguage" value={locale} />
          <div>
            <p className="text-sm font-medium text-text-main">
              {t("signOut")}
            </p>
          </div>
          <SignOutButton
            label={t("signOut")}
            pendingLabel={t("signingOut")}
          />
        </form>

        <form
          action={passwordAction}
          className="rounded-xl border border-line bg-panel-elevated p-4"
        >
          <input type="hidden" name="interfaceLanguage" value={locale} />
          <div className="mb-4">
            <p className="flex items-center gap-2 text-sm font-medium text-text-main">
              <LockKeyhole className="h-4 w-4 text-text-muted" />
              {t("changePassword")}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              name="currentPassword"
              type="password"
              value={currentPasswordValue}
              onChange={(e) => setCurrentPasswordValue(e.target.value)}
              autoComplete="current-password"
              placeholder={t("currentPassword")}
              required
              className="h-11 rounded-xl border border-line bg-field px-4 text-sm text-text-main outline-none transition-all placeholder:text-text-faint focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
            />
            <input
              name="password"
              type="password"
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              autoComplete="new-password"
              placeholder={t("newPassword")}
              minLength={6}
              required
              className="h-11 rounded-xl border border-line bg-field px-4 text-sm text-text-main outline-none transition-all placeholder:text-text-faint focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
            />
            <input
              name="confirmPassword"
              type="password"
              value={confirmPasswordValue}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
              autoComplete="new-password"
              placeholder={t("repeatNewPassword")}
              minLength={6}
              required
              className="h-11 rounded-xl border border-line bg-field px-4 text-sm text-text-main outline-none transition-all placeholder:text-text-faint focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
            />
          </div>

          {(passwordState.error || passwordState.message) && (
            <div
              className={`mt-3 flex gap-2 rounded-xl border px-3 py-2 text-sm ${
                passwordState.error
                  ? "border-danger-border bg-danger-soft text-danger-text"
                  : "border-success-border bg-success-soft text-success-text"
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

          <IconTextButton
            type="submit"
            icon={Save}
            loading={passwordPending}
            disabled={passwordPending || !isFormValid}
            tone={ICON_TEXT_BUTTON_TONES.PRIMARY_GRADIENT}
            strong
            className="mt-4 h-10"
          >
            {t("changePassword")}
          </IconTextButton>
        </form>
      </div>
    </SettingsSectionPanel>
  );
}
