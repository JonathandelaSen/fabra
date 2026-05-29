"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, KeyRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { InterfaceLanguageSelect } from "@/components/shared/interface-language-select";
import { useUpdatePasswordFormState } from "../hooks/use-update-password-form-state";

export function UpdatePasswordForm() {
  const t = useTranslations("auth.updatePassword");
  const auth = useTranslations("auth");
  const { locale } = useInterfaceLanguage();
  const { state, action, pending } = useUpdatePasswordFormState();

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d14]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
      <div className="mb-6">
        <div className="mb-4 flex justify-end">
          <InterfaceLanguageSelect compact />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {t("description")}
        </p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="interfaceLanguage" value={locale} />
        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300">
            {t("passwordLabel")}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={auth("fields.passwordPlaceholder")}
            minLength={6}
            required
            className="h-11 border-white/[0.08] bg-white/[0.04]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-zinc-300">
            {t("confirmLabel")}
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder={t("confirmPlaceholder")}
            minLength={6}
            required
            className="h-11 border-white/[0.08] bg-white/[0.04]"
          />
        </div>

        {state.error && (
          <Alert
            variant="destructive"
            className="border-rose-500/20 bg-rose-500/10"
          >
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-rose-200">
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
          disabled={pending}
          className="h-11"
        >
          {t("submit")}
        </IconTextButton>
      </form>
    </div>
  );
}
