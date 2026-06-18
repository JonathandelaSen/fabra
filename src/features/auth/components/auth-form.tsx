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
import { isValidEmail, isValidPassword } from "@/frontend/auth-validation";

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
    passwordValue,
    resendAction,
    resendEmail,
    resendPending,
    setEmailValue,
    setPasswordValue,
    setMode,
    setShowPassword,
    showPassword,
    showResendConfirmation,
    signupAction,
    visibleError,
    visibleMessage,
  } = useAuthFormState(initialError, initialMessage);

  const isEmailValid = isValidEmail(emailValue);
  const isPasswordValid = isValidPassword(passwordValue);
  const isFormValid = isRecover ? isEmailValid : (isEmailValid && isPasswordValid);
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
    <div className="rounded-2xl border border-line bg-panel-base/90 backdrop-blur-xl p-5 shadow-2xl shadow-[var(--ui-shadow-strong)] sm:p-6">
      <div className="mb-6">
        <div className="mb-4 flex justify-end">
          <InterfaceLanguageSelect compact />
        </div>
        <h2 className="text-2xl font-bold text-text-main">{title}</h2>
        {description && <p className="mt-2 text-sm text-text-muted">{description}</p>}
      </div>

      {!isRecover && (
        <>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-panel/[0.04] p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`h-9 rounded-md text-sm font-medium transition-all ${
                !isSignup
                  ? "bg-panel/[0.08] text-text-on-bright shadow-sm"
                  : "text-text-muted hover:text-text-soft"
              }`}
            >
              {t("login.tab")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`h-9 rounded-md text-sm font-medium transition-all ${
                isSignup
                  ? "bg-panel/[0.08] text-text-on-bright shadow-sm"
                  : "text-text-muted hover:text-text-soft"
              }`}
            >
              {t("signup.tab")}
            </button>
          </div>

        </>
      )}

      <form
        action={isRecover ? undefined : isSignup ? signupAction : loginAction}
        onSubmit={isRecover ? handleRecoverSubmit : undefined}
        className="space-y-4"
      >
        <input type="hidden" name="interfaceLanguage" value={locale} />
        <div className="space-y-2">
          <Label htmlFor="email" className="text-text-soft">
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
            className="h-11 bg-panel/[0.04] border-line/[0.08]"
          />
        </div>

        {!isRecover && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-text-soft">
              {t("fields.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder={t("fields.passwordPlaceholder")}
                minLength={6}
                required
                className="h-11 border-line/[0.08] bg-panel/[0.04] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-2 flex w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-panel/[0.06] hover:text-text-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-border"
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
          <Alert variant="destructive" className="border-danger-border bg-danger-soft">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-danger-text">
              {visibleError}
            </AlertDescription>
          </Alert>
        )}

        {visibleMessage && (
          <Alert className="border-success-border bg-success/10">
            <CheckCircle2 className="w-4 h-4 text-success-text" />
            <AlertDescription className="text-success-text">
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
          disabled={pending || !isFormValid}
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
              className="font-medium text-text-muted transition-colors hover:text-text-soft"
            >
              {t("recover.backToLogin")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-text-muted transition-colors hover:text-text-soft"
            >
              {t("recover.goToSignup")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setMode("recover")}
            className="font-medium text-action-text transition-colors hover:text-action-text"
          >
            {t("recover.link")}
          </button>
        )}
      </div>
    </div>
  );
}
