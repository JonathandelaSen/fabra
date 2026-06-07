import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { SidebarListItem } from "./sidebar-list-item";

const messages = getMessages("en");
const TITLE = messages.receivedFeedback.title;
const SUBTITLE = messages.receivedFeedback.subtitles.create;
const FOOTER = messages.receivedFeedback.labels.general;

describe("SidebarListItem", () => {
  it("uses button semantics and calls the selection action", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <SidebarListItem title={TITLE} selected={false} onClick={onClick} />,
    );

    const item = screen.getByRole("button", { name: TITLE });
    expect(item).toHaveAttribute("type", "button");

    await user.click(item);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders optional supporting content", () => {
    renderWithProviders(
      <SidebarListItem
        title={TITLE}
        selected
        onClick={vi.fn()}
        subtitle={<span>{SUBTITLE}</span>}
        footer={<span>{FOOTER}</span>}
      />,
    );

    expect(screen.getByText(SUBTITLE)).toBeInTheDocument();
    expect(screen.getByText(FOOTER)).toBeInTheDocument();
  });

  it("applies the requested title clamp behavior", () => {
    const { rerender } = renderWithProviders(
      <SidebarListItem title={TITLE} selected={false} onClick={vi.fn()} />,
    );

    expect(screen.getByText(TITLE)).toHaveClass("truncate");

    rerender(
      <SidebarListItem
        title={TITLE}
        selected={false}
        onClick={vi.fn()}
        titleClamp={2}
      />,
    );

    expect(screen.getByText(TITLE)).toHaveClass("line-clamp-2");
  });
});
