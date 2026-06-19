"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, KeyRound } from "lucide-react";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { useInterfaceLanguage } from "@/frontend/components/shared/i18n-provider";
import { InterfaceLanguageSelect } from "@/frontend/components/shared/interface-language-select";
import { useUpdatePasswordFormState } from "../hooks/use-update-password-form-state";
import { isValidPassword } from "@/frontend/utils/auth-validation";

export function UpdatePasswordForm() {
  const t = useTranslations("auth.updatePassword");
  const auth = useTranslations("auth");
  const { locale } = useInterfaceLanguage();
  const { state, action, pending } = useUpdatePasswordFormState();
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  const isFormValid = isValidPassword(passwordValue) && isValidPassword(confirmPasswordValue);

  return (
    <div className="rounded-2xl border border-line bg-panel-base/90 p-5 shadow-2xl shadow-[var(--ui-shadow-strong)] backdrop-blur-xl sm:p-6">
      <div className="mb-6">
        <div className="mb-4 flex justify-end">
          <InterfaceLanguageSelect compact />
        </div>
        <h2 className="text-2xl font-bold text-text-main">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          {t("description")}
        </p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="interfaceLanguage" value={locale} />
        <div className="space-y-2">
          <Label htmlFor="password" className="text-text-soft">
            {t("passwordLabel")}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            autoComplete="new-password"
            placeholder={auth("fields.passwordPlaceholder")}
            minLength={6}
            required
            className="h-11 border-line/[0.08] bg-panel/[0.04]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-text-soft">
            {t("confirmLabel")}
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPasswordValue}
            onChange={(e) => setConfirmPasswordValue(e.target.value)}
            autoComplete="new-password"
            placeholder={t("confirmPlaceholder")}
            minLength={6}
            required
            className="h-11 border-line/[0.08] bg-panel/[0.04]"
          />
        </div>

        {state.error && (
          <Alert
            variant="destructive"
            className="border-danger-border bg-danger-soft"
          >
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-danger-text">
              {state.error}
            </AlertDescription>
          </Alert>
        )}

        <IconTextButton
          type="submit"
          icon={KeyRound}
          loading={pending}
          tone={ICON_TEXT_BUTTON_TONES.PRIMARY_GRADIENT}
          fullWidth
          strong
          disabled={pending || !isFormValid}
          className="h-11"
        >
          {t("submit")}
        </IconTextButton>
      </form>
    </div>
  );
}
