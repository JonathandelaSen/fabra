import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { FeatureDetailTabBar } from "./feature-detail-tab-bar";

const messages = getMessages("en");
const SUMMARY = messages.analysisDetail.tabs.summary;
const TRACKING = messages.analysisDetail.tabs.tracking;

describe("FeatureDetailTabBar", () => {
  it("renders tabs, marks the active option, and reports changes", async () => {
    const onTabChange = vi.fn();
    const { user } = renderWithProviders(
      <FeatureDetailTabBar
        tabs={[
          { id: "summary", label: SUMMARY, icon: <span /> },
          { id: "tracking", label: TRACKING, icon: <span /> },
        ]}
        activeTab="summary"
        onTabChange={onTabChange}
      />,
    );

    expect(screen.getByRole("tab", { name: SUMMARY })).toHaveClass(
      "bg-panel-active",
    );
    expect(screen.getByRole("tab", { name: SUMMARY })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("tab", { name: TRACKING }));

    expect(onTabChange).toHaveBeenCalledWith("tracking");
  });

  it("does not submit a parent form when changing tabs", async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { user } = renderWithProviders(
      <form onSubmit={onSubmit}>
        <FeatureDetailTabBar
          tabs={[{ id: "summary", label: SUMMARY, icon: <span /> }]}
          activeTab="summary"
          onTabChange={vi.fn()}
        />
      </form>,
    );

    await user.click(screen.getByRole("tab", { name: SUMMARY }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
