import type { InterfaceLanguage } from "@/i18n/config";

export async function saveInterfaceLanguage(locale: InterfaceLanguage) {
  const response = await fetch("/api/user-preferences/interface-language", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale }),
  });
  if (!response.ok && response.status !== 401) {
    throw new Error("Could not save interface language preference");
  }
}
