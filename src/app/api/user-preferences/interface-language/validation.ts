import {
  isInterfaceLanguage,
  type InterfaceLanguage,
} from "@/frontend/i18n/config";

type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

interface HttpValidationError {
  message: string;
  status: 400;
}

export interface UpdateInterfaceLanguagePreferenceRequest {
  locale: InterfaceLanguage;
}

export function parseUpdateInterfaceLanguagePreferenceRequest(
  body: unknown,
): Result<UpdateInterfaceLanguagePreferenceRequest, HttpValidationError> {
  if (
    typeof body !== "object" ||
    body === null ||
    !isInterfaceLanguage((body as { locale?: unknown }).locale)
  ) {
    return {
      ok: false,
      error: { message: "Invalid interface language.", status: 400 },
    };
  }

  return {
    ok: true,
    value: { locale: (body as { locale: InterfaceLanguage }).locale },
  };
}
