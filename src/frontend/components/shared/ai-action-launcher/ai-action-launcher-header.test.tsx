import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import AIActionLauncherHeader from "./ai-action-launcher-header";

const messages = getMessages("en");
const TITLE = messages.aiLauncher.title;
const CLOSE_LABEL = messages.common.actions.close;

describe("AIActionLauncherHeader", () => {
  it("renders the header title and icon correctly", () => {
    const { container } = renderWithProviders(<AIActionLauncherHeader />);

    expect(screen.getByRole("heading", { level: 3, name: TITLE })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders close button and calls onClose when clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(<AIActionLauncherHeader onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: CLOSE_LABEL });
    expect(closeBtn).toBeInTheDocument();

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
