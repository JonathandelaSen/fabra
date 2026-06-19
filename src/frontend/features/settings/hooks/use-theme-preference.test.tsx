import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { useThemePreference } from "./use-theme-preference";

describe("useThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.style.colorScheme = "";
  });

  it("loads and applies the stored theme on mount", () => {
    localStorage.setItem("fabra.theme", "light");

    const { result } = renderHookWithProviders(() => useThemePreference());

    expect(result.current.theme).toBe("light");
    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("persists and applies theme changes", () => {
    const { result } = renderHookWithProviders(() => useThemePreference());

    act(() => {
      result.current.changeTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem("fabra.theme")).toBe("light");
    expect(document.documentElement).toHaveClass("light");
  });

  it("synchronizes state when another browser context changes storage", () => {
    const { result } = renderHookWithProviders(() => useThemePreference());
    localStorage.setItem("fabra.theme", "light");

    act(() => {
      window.dispatchEvent(new StorageEvent("storage"));
    });

    expect(result.current.theme).toBe("light");
  });
});
