import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";

export type StoredAIProvider = "gemini" | "mock" | "openai";
export type StoredThemePreference = "light" | "dark";
export type StoredAIDefaultApiKeys = Partial<Record<StoredAIProvider, string>>;

const AI_PROVIDER_STORAGE_KEY = "ats-cv-ai-checker.aiProvider";
const AI_API_KEY_STORAGE_KEY = "ats-cv-ai-checker.aiApiKey";
const AI_MODEL_STORAGE_KEY = "ats-cv-ai-checker.aiModel";
export const AI_SETTINGS_CHANGED_EVENT = "ats-cv-ai-checker.aiSettingsChanged";
const THEME_STORAGE_KEY = "ats-cv-ai-checker.theme";
const DEFAULT_AI_PROVIDER: StoredAIProvider = "gemini";
const DEFAULT_THEME: StoredThemePreference = "dark";

const DEFAULT_AI_MODEL = DEFAULT_GEMINI_MODEL;

function getLocalStorage() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeProvider(value: string | null): StoredAIProvider {
  return value === "mock" || value === "gemini" || value === "openai" ? value : DEFAULT_AI_PROVIDER;
}

function normalizeTheme(value: string | null): StoredThemePreference {
  return value === "light" || value === "dark" ? value : DEFAULT_THEME;
}

function notifyAISettingsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AI_SETTINGS_CHANGED_EVENT));
}

export function getStoredAIProvider(): StoredAIProvider {
  return normalizeProvider(getLocalStorage()?.getItem(AI_PROVIDER_STORAGE_KEY) ?? null);
}

export function getStoredAIApiKeyForProvider(
  provider: StoredAIProvider,
  defaultApiKeys: StoredAIDefaultApiKeys = {},
): string {
  const storage = getLocalStorage();
  if (!storage) return defaultApiKeys[provider]?.trim() ?? "";
  const providerKey = `ats-cv-ai-checker.aiApiKey.${provider}`;
  const stored = storage.getItem(providerKey);
  if (stored !== null) return stored.trim();

  // Fallback to legacy key if the requested provider is the active one
  const activeProvider = getStoredAIProvider();
  if (activeProvider === provider) {
    const legacyKey = storage.getItem(AI_API_KEY_STORAGE_KEY);
    if (legacyKey !== null) return legacyKey.trim();
  }
  return defaultApiKeys[provider]?.trim() ?? "";
}

export function getStoredAIApiKey(
  defaultApiKeys: StoredAIDefaultApiKeys = {},
): string {
  const provider = getStoredAIProvider();
  return getStoredAIApiKeyForProvider(provider, defaultApiKeys);
}

export function getAIApiKeyForProvider(
  provider: StoredAIProvider,
  currentApiKey = "",
  defaultApiKeys: StoredAIDefaultApiKeys = {},
): string {
  if (provider === "mock") return "";
  const providerKey = getStoredAIApiKeyForProvider(provider, defaultApiKeys);
  if (providerKey) return providerKey;
  return getStoredAIProvider() === provider ? currentApiKey.trim() : "";
}

export function getStoredAIModel() {
  return getLocalStorage()?.getItem(AI_MODEL_STORAGE_KEY)?.trim() || DEFAULT_AI_MODEL;
}

export function saveStoredAIApiKeyForProvider(provider: StoredAIProvider, apiKey: string) {
  const storage = getLocalStorage();
  if (!storage) return;
  const key = apiKey.trim();
  const providerKey = `ats-cv-ai-checker.aiApiKey.${provider}`;

  if (key) {
    storage.setItem(providerKey, key);
  } else {
    storage.removeItem(providerKey);
  }

  // Also sync to active/legacy key if this is the active provider
  const activeProvider = getStoredAIProvider();
  if (activeProvider === provider) {
    if (key) {
      storage.setItem(AI_API_KEY_STORAGE_KEY, key);
    } else {
      storage.removeItem(AI_API_KEY_STORAGE_KEY);
    }
  }

  notifyAISettingsChanged();
}

export function removeStoredAIApiKeyForProvider(provider: StoredAIProvider) {
  saveStoredAIApiKeyForProvider(provider, "");
}

export function saveStoredAIProvider(provider: StoredAIProvider) {
  const storage = getLocalStorage();
  if (!storage) return;
  const normalized = normalizeProvider(provider);
  storage.setItem(AI_PROVIDER_STORAGE_KEY, normalized);

  // Sync the active key to legacy key so that getStoredAIApiKey works
  const activeKey = getStoredAIApiKeyForProvider(normalized);
  if (activeKey) {
    storage.setItem(AI_API_KEY_STORAGE_KEY, activeKey);
  } else {
    storage.removeItem(AI_API_KEY_STORAGE_KEY);
  }

  notifyAISettingsChanged();
}

export function saveStoredAISettings(input: {
  provider: StoredAIProvider;
  apiKey: string;
  model: string;
}) {
  const storage = getLocalStorage();
  const settings = {
    provider: normalizeProvider(input.provider),
    apiKey: input.apiKey.trim(),
    model: input.model.trim() || DEFAULT_AI_MODEL,
  };

  if (!storage) return settings;

  storage.setItem(AI_PROVIDER_STORAGE_KEY, settings.provider);
  storage.setItem(AI_MODEL_STORAGE_KEY, settings.model);
  
  // Save to both provider-specific and legacy key
  saveStoredAIApiKeyForProvider(settings.provider, settings.apiKey);

  notifyAISettingsChanged();

  return settings;
}

export function removeStoredAISettings() {
  const storage = getLocalStorage();
  storage?.removeItem(AI_PROVIDER_STORAGE_KEY);
  storage?.removeItem(AI_API_KEY_STORAGE_KEY);
  storage?.removeItem(AI_MODEL_STORAGE_KEY);
  storage?.removeItem("ats-cv-ai-checker.aiApiKey.gemini");
  storage?.removeItem("ats-cv-ai-checker.aiApiKey.openai");
  notifyAISettingsChanged();
}

export function hasStoredAIApiKey() {
  return getStoredAIApiKey().length > 0;
}

export function getStoredThemePreference(): StoredThemePreference {
  return normalizeTheme(getLocalStorage()?.getItem(THEME_STORAGE_KEY) ?? null);
}

export function applyStoredThemePreference(theme: StoredThemePreference) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", theme);
}

export function saveStoredThemePreference(input: StoredThemePreference) {
  const theme = normalizeTheme(input);
  getLocalStorage()?.setItem(THEME_STORAGE_KEY, theme);
  applyStoredThemePreference(theme);
  return theme;
}
