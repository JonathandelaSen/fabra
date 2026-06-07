import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import {
  ACTION_ICON_BUTTON_SIZES,
  ACTION_ICON_BUTTON_TONES,
  ActionIconButton,
} from "./action-icon-button";

function TestIcon({ className }: { className?: string }) {
  return <svg data-testid="action-icon" className={className} />;
}

const messages = getMessages("en");
const DELETE_LABEL = messages.common.actions.delete;
const SAVE_LABEL = messages.common.actions.save;
const PRIMARY_ACTION_LABEL = messages.common.actions.configure;

describe("ActionIconButton", () => {
  it("exposes the consumer-provided accessible name and calls the action", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <ActionIconButton
        icon={TestIcon}
        aria-label={DELETE_LABEL}
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: DELETE_LABEL }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prevents interaction and replaces the icon while loading", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <ActionIconButton
        icon={TestIcon}
        aria-label={SAVE_LABEL}
        loading
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: SAVE_LABEL });
    expect(button).toBeDisabled();
    expect(screen.queryByTestId("action-icon")).not.toBeInTheDocument();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the requested shared size and tone", () => {
    renderWithProviders(
      <ActionIconButton
        icon={TestIcon}
        aria-label={PRIMARY_ACTION_LABEL}
        buttonSize={ACTION_ICON_BUTTON_SIZES.LG}
        tone={ACTION_ICON_BUTTON_TONES.PRIMARY}
        className="consumer-class"
      />,
    );

    expect(screen.getByRole("button", { name: PRIMARY_ACTION_LABEL })).toHaveClass(
      "h-10",
      "w-10",
      "bg-action",
      "consumer-class",
    );
  });
});
