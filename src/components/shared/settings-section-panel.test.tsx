import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { SettingsSectionPanel } from "./settings-section-panel";
import type { LucideIcon } from "lucide-react";

const messages = getMessages("en");
const PANEL_TITLE = messages.settings.title;
const PANEL_DESCRIPTION = messages.settings.language.description;
const CHILD_TEXT = messages.common.actions.save;

const TestIcon = (({ className }: { className?: string }) => {
  return <svg data-testid="test-icon" className={className} />;
}) as unknown as LucideIcon;

describe("SettingsSectionPanel", () => {
  it("renders the title, icon, and children correctly", () => {
    renderWithProviders(
      <SettingsSectionPanel title={PANEL_TITLE} icon={TestIcon}>
        <div data-testid="settings-child">{CHILD_TEXT}</div>
      </SettingsSectionPanel>
    );

    expect(screen.getByRole("heading", { level: 2, name: PANEL_TITLE })).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByTestId("settings-child")).toBeInTheDocument();
    expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(PANEL_DESCRIPTION)).not.toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    renderWithProviders(
      <SettingsSectionPanel
        title={PANEL_TITLE}
        icon={TestIcon}
        description={PANEL_DESCRIPTION}
      >
        <div>{CHILD_TEXT}</div>
      </SettingsSectionPanel>
    );

    expect(screen.getByText(PANEL_DESCRIPTION)).toBeInTheDocument();
  });
});
