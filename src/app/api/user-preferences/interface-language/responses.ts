import type { InterfaceLanguage } from "@/i18n/config";

export interface InterfaceLanguagePreferenceResponse {
  interfaceLanguage: InterfaceLanguage;
}

export function toInterfaceLanguagePreferenceResponse(
  interfaceLanguage: InterfaceLanguage,
): InterfaceLanguagePreferenceResponse {
  return { interfaceLanguage };
}
