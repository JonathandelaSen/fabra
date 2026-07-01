import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/frontend/testing/render";
import { OpportunityPersonForm } from "./opportunity-person-form";

describe("OpportunityPersonForm", () => {
  it("submits required fields and a user-labelled link", async () => {
    const onSubmit = vi.fn(async () => undefined);
    const { user } = renderWithProviders(
      <OpportunityPersonForm
        isSaving={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Name"), "Marta García");
    await user.selectOptions(screen.getByLabelText("Primary role"), "hiring_manager");
    await user.click(screen.getByRole("button", { name: "Add link" }));
    await user.type(screen.getByLabelText("Link URL 1"), "https://example.com/marta");
    await user.type(screen.getByLabelText("Link label 1"), "Profile");
    await user.click(screen.getByRole("button", { name: "Create person" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Marta García",
      role: "hiring_manager",
      jobTitle: null,
      organization: null,
      email: null,
      phone: null,
      links: [{ url: "https://example.com/marta", label: "Profile" }],
      notes: null,
    });
  });

  it("prefills an existing profile for editing", () => {
    renderWithProviders(
      <OpportunityPersonForm
        person={{
          id: "person-1",
          name: "Marta García",
          role: "hiring_manager",
          jobTitle: "Engineering Manager",
          organization: "Acme",
          email: null,
          phone: null,
          links: [],
          notes: null,
          createdAt: "2026-06-30T09:00:00.000Z",
          updatedAt: "2026-06-30T09:00:00.000Z",
        }}
        isSaving={false}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Marta García");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("allows link URLs missing a protocol on submit without prepending anything", async () => {
    const onSubmit = vi.fn(async () => undefined);
    const { user } = renderWithProviders(
      <OpportunityPersonForm
        isSaving={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Name"), "Marta García");
    await user.selectOptions(screen.getByLabelText("Primary role"), "hiring_manager");
    await user.click(screen.getByRole("button", { name: "Add link" }));
    await user.type(screen.getByLabelText("Link URL 1"), "www.example.com/marta");
    await user.click(screen.getByRole("button", { name: "Create person" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Marta García",
      role: "hiring_manager",
      jobTitle: null,
      organization: null,
      email: null,
      phone: null,
      links: [{ url: "www.example.com/marta", label: null }],
      notes: null,
    });
  });
});
