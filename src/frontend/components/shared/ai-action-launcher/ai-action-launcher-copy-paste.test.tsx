import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import AIActionLauncherCopyPaste from "./ai-action-launcher-copy-paste";

const messages = getMessages("en");
const EXTERNAL_LABEL = messages.aiLauncher.externalLabel;
const EXTERNAL_DESC = messages.aiLauncher.externalDesc;
const OPEN_FLOW = messages.aiLauncher.openFlow;

describe("AIActionLauncherCopyPaste", () => {
  it("renders correctly with translations", () => {
    const handleOpenFlow = vi.fn();
    const handleClose = vi.fn();
    const { container } = renderWithProviders(
      <AIActionLauncherCopyPaste onOpenFlow={handleOpenFlow} onClose={handleClose} />
    );

    expect(screen.getByRole("heading", { level: 4, name: EXTERNAL_LABEL })).toBeInTheDocument();
    expect(screen.getByText(EXTERNAL_DESC)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: OPEN_FLOW })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onClose and onOpenFlow when openFlow button is clicked", async () => {
    const handleOpenFlow = vi.fn();
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <AIActionLauncherCopyPaste onOpenFlow={handleOpenFlow} onClose={handleClose} />
    );

    const button = screen.getByRole("button", { name: OPEN_FLOW });
    await user.click(button);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleOpenFlow).toHaveBeenCalledTimes(1);
  });
});
