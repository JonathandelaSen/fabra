import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { ALERT_BANNER_TONES, AlertBanner } from "./alert-banner";

function TestIcon({ className }: { className?: string }) {
  return <svg data-testid="alert-icon" className={className} />;
}

const messages = getMessages("en");
const ALERT_TITLE = messages.settings.apiKey.warningTitle;
const ALERT_BODY = messages.settings.apiKey.warningBody;
const ERROR_BODY = messages.auth.errors.signInFailed;
const SUCCESS_BODY = messages.settings.language.saved;

describe("AlertBanner", () => {
  it("renders an optional semantic title, icon, and body", () => {
    renderWithProviders(
      <AlertBanner
        tone={ALERT_BANNER_TONES.WARNING}
        icon={TestIcon}
        title={ALERT_TITLE}
      >
        {ALERT_BODY}
      </AlertBanner>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: ALERT_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    expect(
      screen.getByText(ALERT_BODY),
    ).toBeInTheDocument();
  });

  it("renders body-only alerts without empty title or icon elements", () => {
    const { container } = renderWithProviders(
      <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
        {ERROR_BODY}
      </AlertBanner>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(screen.getByText(ERROR_BODY)).toBeInTheDocument();
  });

  it("preserves the requested tone and consumer class", () => {
    const { container } = renderWithProviders(
      <AlertBanner
        tone={ALERT_BANNER_TONES.SUCCESS}
        className="mt-3"
      >
        {SUCCESS_BODY}
      </AlertBanner>,
    );

    expect(container.firstChild).toHaveClass(
      "bg-success-soft",
      "border-success-border",
      "mt-3",
    );
  });
});
