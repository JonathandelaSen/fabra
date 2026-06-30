import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/frontend/testing/render";
import { OpportunityPersonCard } from "./opportunity-person-card";

const person = {
  id: "person-1",
  name: "Marta García",
  role: "hiring_manager" as const,
  jobTitle: "Engineering Manager",
  organization: "Acme",
  email: "marta@example.com",
  phone: "+34 600 000 000",
  links: [{ url: "https://example.com/marta", label: "Profile" }],
  notes: "Owns platform reliability.",
  createdAt: "2026-06-30T09:00:00.000Z",
  updatedAt: "2026-06-30T09:00:00.000Z",
};

describe("OpportunityPersonCard", () => {
  it("presents the profile and exposes its three primary actions", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onPrepareConversation = vi.fn();
    const { user } = renderWithProviders(
      <OpportunityPersonCard
        person={person}
        onEdit={onEdit}
        onDelete={onDelete}
        onPrepareConversation={onPrepareConversation}
      />,
    );

    expect(screen.getByText("Marta García")).toBeInTheDocument();
    expect(screen.getByText("Hiring manager")).toBeInTheDocument();
    expect(screen.getByText("Engineering Manager · Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "https://example.com/marta",
    );
    expect(screen.getByRole("link", { name: "marta@example.com" })).toHaveAttribute(
      "href",
      "mailto:marta@example.com",
    );

    await user.click(
      screen.getByRole("button", { name: "Prepare conversation" }),
    );
    await user.click(screen.getByRole("button", { name: "Edit Marta García" }));
    await user.click(
      screen.getByRole("button", { name: "Delete Marta García" }),
    );

    expect(onPrepareConversation).toHaveBeenCalledWith(person);
    expect(onEdit).toHaveBeenCalledWith(person);
    expect(onDelete).toHaveBeenCalledWith(person);
  });
});
