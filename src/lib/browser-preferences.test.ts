import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AI_PROVIDER,
  getStoredAIApiKeyForProvider,
  getStoredAIBaseUrlForProvider,
  saveStoredAIApiKeyForProvider,
  saveStoredAIBaseUrlForProvider,
} from "./browser-preferences";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("browser AI preferences", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        dispatchEvent: () => true,
        localStorage: createMemoryStorage(),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });

  it("uses only browser-stored API keys and ignores external defaults", () => {
    expect(
      (getStoredAIApiKeyForProvider as unknown as (...args: unknown[]) => string)(
        AI_PROVIDER.GEMINI,
        { [AI_PROVIDER.GEMINI]: "server-key" },
      ),
    ).toBe("");

    saveStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI, "browser-key");
    expect(getStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI)).toBe("browser-key");

    saveStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI, "");
    expect(
      (getStoredAIApiKeyForProvider as unknown as (...args: unknown[]) => string)(
        AI_PROVIDER.GEMINI,
        { [AI_PROVIDER.GEMINI]: "server-key" },
      ),
    ).toBe("");
  });

  it("uses only browser-stored base URLs and keeps Ollama empty after deletion", () => {
    expect(
      (getStoredAIBaseUrlForProvider as unknown as (...args: unknown[]) => string)(
        AI_PROVIDER.OLLAMA,
        { [AI_PROVIDER.OLLAMA]: "http://server-ollama:11434" },
      ),
    ).toBe("");

    saveStoredAIBaseUrlForProvider(AI_PROVIDER.OLLAMA, "http://localhost:11434");
    expect(getStoredAIBaseUrlForProvider(AI_PROVIDER.OLLAMA)).toBe("http://localhost:11434");

    saveStoredAIBaseUrlForProvider(AI_PROVIDER.OLLAMA, "");
    expect(
      (getStoredAIBaseUrlForProvider as unknown as (...args: unknown[]) => string)(
        AI_PROVIDER.OLLAMA,
        { [AI_PROVIDER.OLLAMA]: "http://server-ollama:11434" },
      ),
    ).toBe("");
  });
});
