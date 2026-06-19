import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMessages } from "@/frontend/i18n/messages";
import { server } from "@/testing/msw/server";
import { I18nProvider } from "@/frontend/components/shared/i18n-provider";
import { useLanguagePreference } from "./use-language-preference";

function Wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider initialLocale="en">{children}</I18nProvider>;
}

describe("useLanguagePreference", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks a successful language change as saved and clears it later", async () => {
    server.use(
      http.put("http://localhost/api/user-preferences/interface-language", () =>
        HttpResponse.json({ ok: true }),
      ),
    );
    vi.useFakeTimers();
    const { result } = renderHook(() => useLanguagePreference(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.changeLanguage("es");
    });

    expect(result.current.locale).toBe("es");
    expect(result.current.saved).toBe(true);
    expect(result.current.error).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(result.current.saved).toBe(false);
  });

  it("reports persistence failures", async () => {
    server.use(
      http.put("http://localhost/api/user-preferences/interface-language", () =>
        HttpResponse.json(
          { error: getMessages("en").settings.language.error },
          { status: 500 },
        ),
      ),
    );
    const { result } = renderHook(() => useLanguagePreference(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.changeLanguage("es");
    });

    await waitFor(() => {
      expect(result.current.error).toBe(true);
    });
    expect(result.current.saved).toBe(false);
  });
});
