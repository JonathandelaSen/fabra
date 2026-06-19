import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import {
  ICON_TEXT_BUTTON_TONES,
  IconTextButton,
} from "./icon-text-button";

function TestIcon({ className }: { className?: string }) {
  return <svg data-testid="action-icon" className={className} />;
}

const messages = getMessages("en");
const SAVE_LABEL = messages.common.actions.save;
const DELETE_LABEL = messages.common.actions.delete;

describe("IconTextButton", () => {
  it("uses button semantics and calls the action once", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <IconTextButton icon={TestIcon} onClick={onClick}>
        {SAVE_LABEL}
      </IconTextButton>,
    );

    const button = screen.getByRole("button", { name: SAVE_LABEL });
    expect(button).toHaveAttribute("type", "button");
    expect(screen.getByTestId("action-icon")).toBeInTheDocument();

    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prevents interaction and replaces the action icon while loading", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <IconTextButton icon={TestIcon} loading onClick={onClick}>
        {SAVE_LABEL}
      </IconTextButton>,
    );

    const button = screen.getByRole("button", { name: SAVE_LABEL });
    expect(button).toBeDisabled();
    expect(screen.queryByTestId("action-icon")).not.toBeInTheDocument();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("preserves explicit button props and shared visual options", () => {
    renderWithProviders(
      <IconTextButton
        icon={TestIcon}
        type="submit"
        fullWidth
        strong
        tone={ICON_TEXT_BUTTON_TONES.DANGER}
        className="consumer-class"
      >
        {DELETE_LABEL}
      </IconTextButton>,
    );

    expect(screen.getByRole("button", { name: DELETE_LABEL })).toHaveClass(
      "w-full",
      "font-semibold",
      "text-danger-text",
      "consumer-class",
    );
    expect(screen.getByRole("button", { name: DELETE_LABEL })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
