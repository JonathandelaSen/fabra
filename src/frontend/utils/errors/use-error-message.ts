"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import {
  resolveErrorMessage,
  type ErrorTranslator,
} from "./resolve-error-message";

/**
 * Hook returning a resolver that turns an unknown error into a localized,
 * user-facing message via the `errors` translation namespace. Use this in
 * components/hooks instead of displaying a raw backend error string.
 */
export function useErrorMessage() {
  const t = useTranslations("errors") as unknown as ErrorTranslator;
  return useCallback((error: unknown) => resolveErrorMessage(t, error), [t]);
}
