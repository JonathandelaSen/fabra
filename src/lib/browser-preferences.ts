import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import { AI_PROVIDER } from "@/backend/modules/shared/domain/value-objects/ai-provider.value-object";

export { AI_PROVIDER };
export type StoredAIProvider = typeof AI_PROVIDER[keyof typeof AI_PROVIDER];
export type StoredThemePreference = "light" | "dark";

const STORAGE_PREFIX = "fabra";
const LEGACY_STORAGE_PREFIX = "ats-cv-ai-checker";
const AI_PROVIDER_STORAGE_KEY = `${STORAGE_PREFIX}.aiProvider`;
const AI_API_KEY_STORAGE_KEY = `${STORAGE_PREFIX}.aiApiKey`;
const AI_BASE_URL_STORAGE_KEY = `${STORAGE_PREFIX}.aiBaseUrl`;
const AI_MODEL_STORAGE_KEY = `${STORAGE_PREFIX}.aiModel`;
export const AI_SETTINGS_CHANGED_EVENT = `${STORAGE_PREFIX}.aiSettingsChanged`;
const THEME_STORAGE_KEY = `${STORAGE_PREFIX}.theme`;
const DEFAULT_AI_PROVIDER: StoredAIProvider = AI_PROVIDER.GEMINI;
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
  return value === AI_PROVIDER.MOCK || value === AI_PROVIDER.GEMINI || value === AI_PROVIDER.OPENAI || value === AI_PROVIDER.OLLAMA ? value : DEFAULT_AI_PROVIDER;
}

function normalizeTheme(value: string | null): StoredThemePreference {
  return value === "light" || value === "dark" ? value : DEFAULT_THEME;
}

function storageKey(suffix: string) {
  return `${STORAGE_PREFIX}.${suffix}`;
}

function getStoredValue(storage: Storage | null | undefined, key: string) {
  if (!storage) return null;
  const stored = storage.getItem(key);
  if (stored !== null) return stored;
  return storage.getItem(key.replace(STORAGE_PREFIX, LEGACY_STORAGE_PREFIX));
}

function notifyAISettingsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AI_SETTINGS_CHANGED_EVENT));
}

export function getStoredAIProvider(): StoredAIProvider {
  return normalizeProvider(getStoredValue(getLocalStorage(), AI_PROVIDER_STORAGE_KEY));
}

export function getStoredAIApiKeyForProvider(provider: StoredAIProvider): string {
  const storage = getLocalStorage();
  if (!storage) return "";
  const providerKey = storageKey(`aiApiKey.${provider}`);
  const stored = getStoredValue(storage, providerKey);
  if (stored !== null) return stored.trim();

  // Fallback to legacy key if the requested provider is the active one
  const activeProvider = getStoredAIProvider();
  if (activeProvider === provider) {
    const legacyKey = getStoredValue(storage, AI_API_KEY_STORAGE_KEY);
    if (legacyKey !== null) return legacyKey.trim();
  }
  return "";
}

export function getStoredAIApiKey(): string {
  const provider = getStoredAIProvider();
  return getStoredAIApiKeyForProvider(provider);
}

export function getStoredAIBaseUrlForProvider(provider: StoredAIProvider): string {
  const storage = getLocalStorage();
  if (!storage) return "";
  const providerKey = storageKey(`aiBaseUrl.${provider}`);
  const stored = getStoredValue(storage, providerKey);
  if (stored !== null) return stored.trim();

  const activeProvider = getStoredAIProvider();
  if (activeProvider === provider) {
    const legacyKey = getStoredValue(storage, AI_BASE_URL_STORAGE_KEY);
    if (legacyKey !== null) return legacyKey.trim();
  }
  return "";
}

export function getStoredAIBaseUrl(): string {
  const provider = getStoredAIProvider();
  return getStoredAIBaseUrlForProvider(provider);
}

export function getAIApiKeyForProvider(
  provider: StoredAIProvider,
  currentApiKey = "",
): string {
  if (provider === AI_PROVIDER.MOCK) return "";
  const providerKey = getStoredAIApiKeyForProvider(provider);
  if (providerKey) return providerKey;
  return getStoredAIProvider() === provider ? currentApiKey.trim() : "";
}

export function getStoredAIModel() {
  return getStoredValue(getLocalStorage(), AI_MODEL_STORAGE_KEY)?.trim() || DEFAULT_AI_MODEL;
}

export function getStoredAIModelForProvider(provider: StoredAIProvider): string {
  const storage = getLocalStorage();
  if (!storage) return provider === AI_PROVIDER.GEMINI ? DEFAULT_AI_MODEL : "";

  const providerModel = getStoredValue(storage, `${AI_MODEL_STORAGE_KEY}.${provider}`)?.trim();
  if (providerModel) return providerModel;

  if (getStoredAIProvider() === provider) {
    const activeModel = getStoredValue(storage, AI_MODEL_STORAGE_KEY)?.trim();
    if (activeModel) return activeModel;
  }

  return provider === AI_PROVIDER.GEMINI ? DEFAULT_AI_MODEL : "";
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
): { provider: StoredAIProvider; apiKey: string; baseUrl: string; model: string; error?: string } {
  const apiKey = getAIApiKeyForProvider(provider, currentApiKey);
  const baseUrl = getStoredAIBaseUrlForProvider(provider);
  const model = provider === AI_PROVIDER.OLLAMA
    ? getStoredAIModelForProvider(AI_PROVIDER.OLLAMA)
    : currentModel.trim() || getStoredAIModelForProvider(provider);

  if (provider === AI_PROVIDER.OLLAMA) {
    if (!baseUrl) {
      return { provider, apiKey: "", baseUrl, model, error: "Configura la URL local de Ollama antes de realizar esta acción." };
    }
    if (!model) {
      return { provider, apiKey: "", baseUrl, model, error: "Configura el modelo local de Ollama antes de realizar esta acción." };
    }
    return { provider, apiKey: "", baseUrl, model };
  }

  if (provider !== AI_PROVIDER.MOCK && !apiKey) {
    return { provider, apiKey, baseUrl, model, error: "Configura tu API key del proveedor de IA." };
  }

  return { provider, apiKey, baseUrl, model };
}

export function saveStoredAIApiKeyForProvider(provider: StoredAIProvider, apiKey: string) {
  const storage = getLocalStorage();
  if (!storage) return;
  const key = apiKey.trim();
  const providerKey = storageKey(`aiApiKey.${provider}`);

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
  const providerKey = storageKey(`aiBaseUrl.${provider}`);

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
  for (const prefix of [STORAGE_PREFIX, LEGACY_STORAGE_PREFIX]) {
    storage?.removeItem(`${prefix}.aiProvider`);
    storage?.removeItem(`${prefix}.aiApiKey`);
    storage?.removeItem(`${prefix}.aiBaseUrl`);
    storage?.removeItem(`${prefix}.aiModel`);
    storage?.removeItem(`${prefix}.aiApiKey.${AI_PROVIDER.GEMINI}`);
    storage?.removeItem(`${prefix}.aiApiKey.${AI_PROVIDER.OPENAI}`);
    storage?.removeItem(`${prefix}.aiApiKey.${AI_PROVIDER.OLLAMA}`);
    storage?.removeItem(`${prefix}.aiBaseUrl.${AI_PROVIDER.GEMINI}`);
    storage?.removeItem(`${prefix}.aiBaseUrl.${AI_PROVIDER.OPENAI}`);
    storage?.removeItem(`${prefix}.aiBaseUrl.${AI_PROVIDER.OLLAMA}`);
    storage?.removeItem(`${prefix}.aiModel.${AI_PROVIDER.GEMINI}`);
    storage?.removeItem(`${prefix}.aiModel.${AI_PROVIDER.OPENAI}`);
    storage?.removeItem(`${prefix}.aiModel.${AI_PROVIDER.OLLAMA}`);
  }
  notifyAISettingsChanged();
}

export function hasStoredAIApiKey() {
  return getStoredAIApiKey().length > 0;
}

export function getStoredThemePreference(): StoredThemePreference {
  return normalizeTheme(getStoredValue(getLocalStorage(), THEME_STORAGE_KEY));
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
