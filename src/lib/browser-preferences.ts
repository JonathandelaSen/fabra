import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";

export type StoredAIProvider = "gemini" | "mock";
export type StoredThemePreference = "light" | "dark";

const AI_PROVIDER_STORAGE_KEY = "ats-cv-ai-checker.aiProvider";
const AI_API_KEY_STORAGE_KEY = "ats-cv-ai-checker.aiApiKey";
const AI_MODEL_STORAGE_KEY = "ats-cv-ai-checker.aiModel";
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
  return value === "mock" || value === "gemini" ? value : DEFAULT_AI_PROVIDER;
}

function normalizeTheme(value: string | null): StoredThemePreference {
  return value === "light" || value === "dark" ? value : DEFAULT_THEME;
}

export function getStoredAIProvider(): StoredAIProvider {
  return normalizeProvider(getLocalStorage()?.getItem(AI_PROVIDER_STORAGE_KEY) ?? null);
}

export function getStoredAIApiKey() {
  return getLocalStorage()?.getItem(AI_API_KEY_STORAGE_KEY)?.trim() ?? "";
}

export function getStoredAIModel() {
  return getLocalStorage()?.getItem(AI_MODEL_STORAGE_KEY)?.trim() || DEFAULT_AI_MODEL;
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
  if (settings.apiKey) {
    storage.setItem(AI_API_KEY_STORAGE_KEY, settings.apiKey);
  } else {
    storage.removeItem(AI_API_KEY_STORAGE_KEY);
  }

  return settings;
}

export function removeStoredAISettings() {
  const storage = getLocalStorage();
  storage?.removeItem(AI_PROVIDER_STORAGE_KEY);
  storage?.removeItem(AI_API_KEY_STORAGE_KEY);
  storage?.removeItem(AI_MODEL_STORAGE_KEY);
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
