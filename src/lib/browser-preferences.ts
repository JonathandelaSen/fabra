import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";

export type StoredAIProvider = "gemini" | "mock" | "openai" | "ollama";
export type StoredThemePreference = "light" | "dark";
export type StoredAIDefaultApiKeys = Partial<Record<StoredAIProvider, string>>;
export type StoredAIDefaultBaseUrls = Partial<Record<StoredAIProvider, string>>;

const AI_PROVIDER_STORAGE_KEY = "ats-cv-ai-checker.aiProvider";
const AI_API_KEY_STORAGE_KEY = "ats-cv-ai-checker.aiApiKey";
const AI_BASE_URL_STORAGE_KEY = "ats-cv-ai-checker.aiBaseUrl";
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
  return value === "mock" || value === "gemini" || value === "openai" || value === "ollama" ? value : DEFAULT_AI_PROVIDER;
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

export function getStoredAIBaseUrlForProvider(
  provider: StoredAIProvider,
  defaultBaseUrls: StoredAIDefaultBaseUrls = {},
): string {
  const storage = getLocalStorage();
  const defaultValue = defaultBaseUrls[provider]?.trim() ?? (provider === "ollama" ? "http://localhost:11434" : "");
  if (!storage) return defaultValue;
  const providerKey = `ats-cv-ai-checker.aiBaseUrl.${provider}`;
  const stored = storage.getItem(providerKey);
  if (stored !== null) return stored.trim();

  const activeProvider = getStoredAIProvider();
  if (activeProvider === provider) {
    const legacyKey = storage.getItem(AI_BASE_URL_STORAGE_KEY);
    if (legacyKey !== null) return legacyKey.trim();
  }
  return defaultValue;
}

export function getStoredAIBaseUrl(
  defaultBaseUrls: StoredAIDefaultBaseUrls = {},
): string {
  const provider = getStoredAIProvider();
  return getStoredAIBaseUrlForProvider(provider, defaultBaseUrls);
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

export function getStoredAIModelForProvider(provider: StoredAIProvider): string {
  const storage = getLocalStorage();
  if (!storage) return provider === "gemini" ? DEFAULT_AI_MODEL : "";

  const providerModel = storage.getItem(`${AI_MODEL_STORAGE_KEY}.${provider}`)?.trim();
  if (providerModel) return providerModel;

  if (getStoredAIProvider() === provider) {
    const activeModel = storage.getItem(AI_MODEL_STORAGE_KEY)?.trim();
    if (activeModel) return activeModel;
  }

  return provider === "gemini" ? DEFAULT_AI_MODEL : "";
}

export function saveStoredAIModelForProvider(provider: StoredAIProvider, model: string) {
  const storage = getLocalStorage();
  if (!storage) return;
  const normalizedModel = model.trim();
  const providerKey = `${AI_MODEL_STORAGE_KEY}.${provider}`;

  if (normalizedModel) {
    storage.setItem(providerKey, normalizedModel);
  } else {
    storage.removeItem(providerKey);
  }

  if (getStoredAIProvider() === provider) {
    if (normalizedModel) {
      storage.setItem(AI_MODEL_STORAGE_KEY, normalizedModel);
    } else {
      storage.removeItem(AI_MODEL_STORAGE_KEY);
    }
  }

  notifyAISettingsChanged();
}

export function getAIRequestConfigForProvider(
  provider: StoredAIProvider,
  currentApiKey = "",
  currentModel = "",
  defaultApiKeys: StoredAIDefaultApiKeys = {},
  defaultBaseUrls: StoredAIDefaultBaseUrls = {},
): { provider: StoredAIProvider; apiKey: string; baseUrl: string; model: string; error?: string } {
  const apiKey = getAIApiKeyForProvider(provider, currentApiKey, defaultApiKeys);
  const baseUrl = getStoredAIBaseUrlForProvider(provider, defaultBaseUrls);
  const model = provider === "ollama"
    ? getStoredAIModelForProvider("ollama")
    : currentModel.trim() || getStoredAIModelForProvider(provider);

  if (provider === "ollama") {
    if (!baseUrl) {
      return { provider, apiKey: "", baseUrl, model, error: "Configura la URL local de Ollama antes de realizar esta acción." };
    }
    if (!model) {
      return { provider, apiKey: "", baseUrl, model, error: "Configura el modelo local de Ollama antes de realizar esta acción." };
    }
    return { provider, apiKey: "", baseUrl, model };
  }

  if (provider !== "mock" && !apiKey) {
    return { provider, apiKey, baseUrl, model, error: "Configura tu API key del proveedor de IA." };
  }

  return { provider, apiKey, baseUrl, model };
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

export function saveStoredAIBaseUrlForProvider(provider: StoredAIProvider, baseUrl: string) {
  const storage = getLocalStorage();
  if (!storage) return;
  const url = baseUrl.trim();
  const providerKey = `ats-cv-ai-checker.aiBaseUrl.${provider}`;

  if (url) {
    storage.setItem(providerKey, url);
  } else {
    storage.removeItem(providerKey);
  }

  const activeProvider = getStoredAIProvider();
  if (activeProvider === provider) {
    if (url) {
      storage.setItem(AI_BASE_URL_STORAGE_KEY, url);
    } else {
      storage.removeItem(AI_BASE_URL_STORAGE_KEY);
    }
  }

  notifyAISettingsChanged();
}

export function removeStoredAIApiKeyForProvider(provider: StoredAIProvider) {
  saveStoredAIApiKeyForProvider(provider, "");
}

export function removeStoredAIBaseUrlForProvider(provider: StoredAIProvider) {
  saveStoredAIBaseUrlForProvider(provider, "");
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
  
  const activeBaseUrl = getStoredAIBaseUrlForProvider(normalized);
  if (activeBaseUrl) {
    storage.setItem(AI_BASE_URL_STORAGE_KEY, activeBaseUrl);
  } else {
    storage.removeItem(AI_BASE_URL_STORAGE_KEY);
  }

  notifyAISettingsChanged();
}

export function saveStoredAISettings(input: {
  provider: StoredAIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}) {
  const storage = getLocalStorage();
  const settings = {
    provider: normalizeProvider(input.provider),
    apiKey: input.apiKey.trim(),
    baseUrl: input.baseUrl?.trim() ?? "",
    model: input.model.trim() || DEFAULT_AI_MODEL,
  };

  if (!storage) return settings;

  storage.setItem(AI_PROVIDER_STORAGE_KEY, settings.provider);
  storage.setItem(AI_MODEL_STORAGE_KEY, settings.model);
  
  // Save to both provider-specific and legacy key
  saveStoredAIApiKeyForProvider(settings.provider, settings.apiKey);
  saveStoredAIBaseUrlForProvider(settings.provider, settings.baseUrl);

  notifyAISettingsChanged();

  return settings;
}

export function removeStoredAISettings() {
  const storage = getLocalStorage();
  storage?.removeItem(AI_PROVIDER_STORAGE_KEY);
  storage?.removeItem(AI_API_KEY_STORAGE_KEY);
  storage?.removeItem(AI_BASE_URL_STORAGE_KEY);
  storage?.removeItem(AI_MODEL_STORAGE_KEY);
  storage?.removeItem("ats-cv-ai-checker.aiApiKey.gemini");
  storage?.removeItem("ats-cv-ai-checker.aiApiKey.openai");
  storage?.removeItem("ats-cv-ai-checker.aiApiKey.ollama");
  storage?.removeItem("ats-cv-ai-checker.aiBaseUrl.gemini");
  storage?.removeItem("ats-cv-ai-checker.aiBaseUrl.openai");
  storage?.removeItem("ats-cv-ai-checker.aiBaseUrl.ollama");
  storage?.removeItem("ats-cv-ai-checker.aiModel.gemini");
  storage?.removeItem("ats-cv-ai-checker.aiModel.openai");
  storage?.removeItem("ats-cv-ai-checker.aiModel.ollama");
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
