"use client";

import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  MailCheck,
  UserPlus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { InterfaceLanguageSelect } from "@/components/shared/interface-language-select";
import { useAuthFormState } from "../hooks/use-auth-form-state";

interface AuthFormProps {
  initialError?: string;
  initialMessage?: string;
}

export function AuthForm({ initialError, initialMessage }: AuthFormProps) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const { locale } = useInterfaceLanguage();
  const {
    emailValue,
    handleRecoverSubmit,
    isRecover,
    isSignup,
    loginAction,
    pending,
    resendAction,
    resendEmail,
    resendPending,
    setEmailValue,
    setMode,
    setShowPassword,
    showPassword,
    showResendConfirmation,
    signupAction,
    visibleError,
    visibleMessage,
  } = useAuthFormState(initialError, initialMessage);
  const title = isRecover
    ? t("recover.title")
    : isSignup
      ? t("signup.title")
      : t("login.title");
  const description = isRecover
    ? t("recover.description")
    : isSignup
      ? t("signup.description")
      : t("login.description");

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d14]/90 backdrop-blur-xl p-5 shadow-2xl shadow-black/30 sm:p-6">
      <div className="mb-6">
        <div className="mb-4 flex justify-end">
          <InterfaceLanguageSelect compact />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100">{title}</h2>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </div>

      {!isRecover && (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.04] p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`h-9 rounded-md text-sm font-medium transition-all ${
              !isSignup
                ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t("login.tab")}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`h-9 rounded-md text-sm font-medium transition-all ${
              isSignup
                ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t("signup.tab")}
          </button>
        </div>
      )}

      <form
        action={isRecover ? undefined : isSignup ? signupAction : loginAction}
        onSubmit={isRecover ? handleRecoverSubmit : undefined}
        className="space-y-4"
      >
        <input type="hidden" name="interfaceLanguage" value={locale} />
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">
            {t("fields.email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={emailValue}
            onChange={(event) => setEmailValue(event.target.value)}
            autoComplete="email"
            placeholder={t("fields.emailPlaceholder")}
            required
            className="h-11 bg-white/[0.04] border-white/[0.08]"
          />
        </div>

        {!isRecover && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              {t("fields.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder={t("fields.passwordPlaceholder")}
                minLength={6}
                required
                className="h-11 border-white/[0.08] bg-white/[0.04] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-2 flex w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                aria-label={
                  showPassword ? common("actions.hidePassword") : common("actions.showPassword")
                }
                title={showPassword ? common("actions.hidePassword") : common("actions.showPassword")}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {visibleError && (
          <Alert variant="destructive" className="border-rose-500/20 bg-rose-500/10">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-rose-200">
              {visibleError}
            </AlertDescription>
          </Alert>
        )}

        {visibleMessage && (
          <Alert className="border-emerald-500/20 bg-emerald-500/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <AlertDescription className="text-emerald-200">
              {visibleMessage}
            </AlertDescription>
          </Alert>
        )}

        <IconTextButton
          type="submit"
          icon={isRecover ? KeyRound : isSignup ? UserPlus : LogIn}
          loading={pending}
          tone={ICON_TEXT_BUTTON_TONES.PRIMARY_GRADIENT}
          fullWidth
          strong
          disabled={pending}
          className="h-11"
        >
          {isRecover
            ? t("recover.submit")
            : isSignup
              ? t("signup.submit")
              : t("login.submit")}
        </IconTextButton>
      </form>

      {showResendConfirmation && (
        <form action={resendAction} className="mt-4">
          <input type="hidden" name="email" value={resendEmail} />
          <input type="hidden" name="interfaceLanguage" value={locale} />
          <IconTextButton
            type="submit"
            icon={MailCheck}
            loading={resendPending}
            tone={ICON_TEXT_BUTTON_TONES.WARNING}
            fullWidth
            disabled={resendPending || !resendEmail}
            className="h-10"
          >
            {t("resendConfirmation")}
          </IconTextButton>
        </form>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        {isRecover ? (
          <>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              {t("recover.backToLogin")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-zinc-400 transition-colors hover:text-zinc-200"
            >
              {t("recover.goToSignup")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setMode("recover")}
            className="font-medium text-indigo-300 transition-colors hover:text-indigo-200"
          >
            {t("recover.link")}
          </button>
        )}
      </div>
    </div>
  );
}
