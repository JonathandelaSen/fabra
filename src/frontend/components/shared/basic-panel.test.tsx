import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { BasicPanel } from "./basic-panel";

const PANEL_CONTENT = getMessages("en").settings.title;

describe("BasicPanel", () => {
  it("renders a panel surface with the default radius", () => {
    renderWithProviders(<BasicPanel>{PANEL_CONTENT}</BasicPanel>);

    expect(screen.getByText(PANEL_CONTENT)).toHaveClass("rounded-lg");
  });

  it("supports semantic element overrides and forwards element props", () => {
    renderWithProviders(
      <BasicPanel as="section" radius="xl" aria-label={PANEL_CONTENT}>
        {PANEL_CONTENT}
      </BasicPanel>,
    );

    expect(screen.getByRole("region", { name: PANEL_CONTENT })).toHaveClass(
      "rounded-xl",
    );
  });
});
