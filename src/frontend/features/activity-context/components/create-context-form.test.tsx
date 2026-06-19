import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { CreateContextForm } from "./create-context-form";

describe("CreateContextForm", () => {
  it("keeps create disabled until a context name is entered", async () => {
    const onCreate = vi.fn();
    const { user } = renderWithProviders(
      <CreateContextForm
        isPending={false}
        hasReturnTo={false}
        onCreate={onCreate}
      />,
    );

    const createButton = screen.getByRole("button", { name: "Create" });
    expect(createButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("Company, project, client, initiative..."),
      "Hiring platform",
    );

    expect(createButton).toBeEnabled();
  });

  it("creates a trimmed project context when submitted", async () => {
    const onCreate = vi.fn();
    const { user } = renderWithProviders(
      <CreateContextForm
        isPending={false}
        hasReturnTo={false}
        onCreate={onCreate}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("Company, project, client, initiative..."),
      "  Hiring platform  ",
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onCreate).toHaveBeenCalledWith({
      name: "Hiring platform",
      type: "project",
    });
  });

  it("submits the selected type and uses the return action copy", async () => {
    const onCreate = vi.fn();
    const { user } = renderWithProviders(
      <CreateContextForm
        isPending={false}
        hasReturnTo={true}
        onCreate={onCreate}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "employment");
    await user.type(
      screen.getByPlaceholderText("Company, project, client, initiative..."),
      "Fabra",
    );
    await user.click(screen.getByRole("button", { name: "Create and return" }));

    expect(onCreate).toHaveBeenCalledWith({
      name: "Fabra",
      type: "employment",
    });
  });

  it("shows the pending state as disabled", () => {
    renderWithProviders(
      <CreateContextForm
        isPending={true}
        hasReturnTo={false}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });
});
