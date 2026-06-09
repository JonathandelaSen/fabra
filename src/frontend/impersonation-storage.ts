const IMPERSONATION_STORAGE_KEY = "fabra.impersonatedEmail";

function getLocalStorage() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function setImpersonationMarker(email: string) {
  getLocalStorage()?.setItem(IMPERSONATION_STORAGE_KEY, email);
}

export function getImpersonationMarker(): string | null {
  return getLocalStorage()?.getItem(IMPERSONATION_STORAGE_KEY) ?? null;
}

export function clearImpersonationMarker() {
  getLocalStorage()?.removeItem(IMPERSONATION_STORAGE_KEY);
}
