import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { DeleteButton } from "./delete-button";

const DELETE_LABEL = getMessages("en").common.actions.delete;

describe("DeleteButton", () => {
  it("uses safe button semantics and calls the action", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <DeleteButton onClick={onClick}>{DELETE_LABEL}</DeleteButton>,
    );

    const button = screen.getByRole("button", { name: DELETE_LABEL });
    expect(button).toHaveAttribute("type", "button");

    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prevents interaction while loading", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <DeleteButton loading onClick={onClick}>
        {DELETE_LABEL}
      </DeleteButton>,
    );

    const button = screen.getByRole("button", { name: DELETE_LABEL });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not submit a parent form by default", async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { user } = renderWithProviders(
      <form onSubmit={onSubmit}>
        <DeleteButton>{DELETE_LABEL}</DeleteButton>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: DELETE_LABEL }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
