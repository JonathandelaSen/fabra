"use client";

import { FormEvent, useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  resendConfirmationEmail,
  signIn,
  signUp,
  type AuthFormState,
} from "../api/auth-actions";
import { sendPasswordRecoveryEmail } from "../api/auth-api";

const INITIAL_STATE: AuthFormState = {};

export function useAuthFormState(initialError?: string, initialMessage?: string) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [loginState, loginAction, loginPending] = useActionState(
    signIn,
    INITIAL_STATE,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signUp,
    INITIAL_STATE,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendConfirmationEmail,
    INITIAL_STATE,
  );
  const [recoverState, setRecoverState] = useState<AuthFormState>(INITIAL_STATE);
  const [recoverPending, setRecoverPending] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "signup";
  const isRecover = mode === "recover";
  const state = isRecover ? recoverState : isSignup ? signupState : loginState;
  const pending = isRecover
    ? recoverPending
    : isSignup
      ? signupPending
      : loginPending;
  const visibleError = resendState.message
    ? initialError
    : resendState.error || state.error || initialError;
  const visibleMessage = resendState.message || state.message || initialMessage;
  const resendEmail = state.email || resendState.email || emailValue.trim();
  const showResendConfirmation =
    !isRecover &&
    (state.canResendConfirmation || resendState.canResendConfirmation);

  async function handleRecoverSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      setRecoverState({ error: t("recover.missingEmail") });
      return;
    }

    setRecoverPending(true);
    setRecoverState({});

    const { error } = await sendPasswordRecoveryEmail(email);

    setRecoverPending(false);

    if (error) {
      setRecoverState({
        error: t("recover.sendError"),
      });
      return;
    }

    setRecoverState({
      message: t("recover.sent"),
    });
  }

  return {
    emailValue,
    handleRecoverSubmit,
    isRecover,
    isSignup,
    loginAction,
    mode,
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
  };
}
