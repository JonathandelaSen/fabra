import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { useTranslations } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { server } from "@/testing/msw/server";
import { I18nProvider, useInterfaceLanguage } from "./i18n-provider";

function LanguageConsumer() {
  const t = useTranslations("common.actions");
  const { locale, setInterfaceLanguage } = useInterfaceLanguage();

  return (
    <>
      <p>{locale}</p>
      <button type="button" onClick={() => setInterfaceLanguage("es")}>
        {t("save")}
      </button>
    </>
  );
}

describe("I18nProvider", () => {
  it("provides the initial locale and its translations", () => {
    render(
      <I18nProvider initialLocale="en">
        <LanguageConsumer />
      </I18nProvider>,
    );

    expect(screen.getByText("en")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("updates locale, translations, document language, cookie, and preference API", async () => {
    const saveRequest = vi.fn();
    server.use(
      http.put(
        "http://localhost/api/user-preferences/interface-language",
        async ({ request }) => {
          saveRequest(await request.json());
          return HttpResponse.json({ ok: true });
        },
      ),
    );
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <LanguageConsumer />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("es")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar" }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
    expect(document.cookie).toContain("interface-language=es");
    expect(saveRequest).toHaveBeenCalledWith({ locale: "es" });
  });
});
