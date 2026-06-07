import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "./i18n-provider";
import { FormattedDate } from "./formatted-date";

const DATE_VALUE = "2026-06-07";
const DATE_TIME_VALUE = "2026-06-07T10:30:00.000Z";

function renderWithLocale(
  locale: "en" | "es",
  component: React.ReactElement,
) {
  return render(
    <I18nProvider initialLocale={locale}>{component}</I18nProvider>,
  );
}

describe("FormattedDate", () => {
  it("renders nothing for missing values", () => {
    const { container } = renderWithLocale(
      "en",
      <FormattedDate value={null} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("uses the interface language and preserves the machine-readable date", () => {
    renderWithLocale("es", <FormattedDate value={DATE_VALUE} icon={null} />);

    const date = screen.getByText(
      new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${DATE_VALUE}T00:00:00`)),
    );
    expect(date).toHaveAttribute("datetime", DATE_VALUE);
  });

  it("supports explicit locale and date-time formatting", () => {
    renderWithLocale(
      "es",
      <FormattedDate
        value={DATE_TIME_VALUE}
        locale="en-US"
        variant="dateTime"
        icon={null}
      />,
    );

    expect(
      screen.getByText(
        new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(DATE_TIME_VALUE)),
      ),
    ).toHaveAttribute("datetime", DATE_TIME_VALUE);
  });
});
