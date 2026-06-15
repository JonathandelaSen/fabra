import { ErrorCode, isErrorCode } from "@/shared/error-codes";
import { ApiError } from "@/frontend/api/api-error";

/**
 * Minimal shape of a next-intl translator scoped to the `errors` namespace.
 * `has` lets us fall back gracefully when a code has no dedicated translation.
 */
export interface ErrorTranslator {
  (key: string, values?: Record<string, unknown>): string;
  has: (key: string) => boolean;
}

export function errorCodeFromUnknown(error: unknown): ErrorCode | null {
  if (error instanceof ApiError) return error.code;
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    isErrorCode((error as { code: unknown }).code)
  ) {
    return (error as { code: ErrorCode }).code;
  }
  return null;
}

/**
 * Resolves an unknown error into a localized, user-facing message using the
 * `errors` translation namespace. Falls back to the code-specific generic
 * message, then to `errors.UNKNOWN`.
 */
export function resolveErrorMessage(t: ErrorTranslator, error: unknown): string {
  const code = errorCodeFromUnknown(error);
  if (code && t.has(code)) {
    const details =
      error instanceof ApiError && error.details ? error.details : undefined;
    return t(code, details);
  }
  return t("UNKNOWN");
}
