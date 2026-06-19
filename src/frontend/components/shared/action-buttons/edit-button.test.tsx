import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { EditButton } from "./edit-button";

const EDIT_LABEL = getMessages("en").common.actions.edit;

describe("EditButton", () => {
  it("uses safe button semantics and calls the action", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <EditButton onClick={onClick}>{EDIT_LABEL}</EditButton>,
    );

    const button = screen.getByRole("button", { name: EDIT_LABEL });
    expect(button).toHaveAttribute("type", "button");

    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prevents interaction while loading", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <EditButton loading onClick={onClick}>
        {EDIT_LABEL}
      </EditButton>,
    );

    const button = screen.getByRole("button", { name: EDIT_LABEL });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
