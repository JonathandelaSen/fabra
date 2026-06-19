import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { getMessages } from "@/frontend/i18n/messages";
import { server } from "@/testing/msw/server";
import { I18nProvider } from "./i18n-provider";
import { InterfaceLanguageSelect } from "./interface-language-select";

describe("InterfaceLanguageSelect", () => {
  it("exposes translated language options and the current locale", () => {
    const messages = getMessages("en").settings.language;
    render(
      <I18nProvider initialLocale="en">
        <InterfaceLanguageSelect />
      </I18nProvider>,
    );

    expect(
      screen.getByRole("combobox", { name: messages.label }),
    ).toHaveValue("en");
    expect(
      screen.getByRole("option", { name: messages.options.en }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: messages.options.es }),
    ).toBeInTheDocument();
  });

  it("persists a selected language and updates the translated control", async () => {
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
    const enMessages = getMessages("en").settings.language;
    const esMessages = getMessages("es").settings.language;
    render(
      <I18nProvider initialLocale="en">
        <InterfaceLanguageSelect />
      </I18nProvider>,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: enMessages.label }),
      "es",
    );

    expect(
      screen.getByRole("combobox", { name: esMessages.label }),
    ).toHaveValue("es");
    expect(saveRequest).toHaveBeenCalledWith({ locale: "es" });
  });
});
