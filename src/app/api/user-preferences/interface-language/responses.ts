import type { InterfaceLanguage } from "@/frontend/i18n/config";

export interface InterfaceLanguagePreferenceResponse {
  interfaceLanguage: InterfaceLanguage;
}

export function toInterfaceLanguagePreferenceResponse(
  interfaceLanguage: InterfaceLanguage,
): InterfaceLanguagePreferenceResponse {
  return { interfaceLanguage };
}
