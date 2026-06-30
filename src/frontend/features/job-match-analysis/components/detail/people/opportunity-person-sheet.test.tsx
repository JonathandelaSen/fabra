import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { OpportunityPersonSheet } from "./opportunity-person-sheet";

describe("OpportunityPersonSheet", () => {
  it("uses the full available width on mobile viewports", async () => {
    renderWithProviders(
      <OpportunityPersonSheet
        open
        person={null}
        isSaving={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const sheet = await screen.findByRole("dialog");
    expect(sheet).toHaveClass("data-[side=right]:w-full");
    expect(sheet).toHaveClass("data-[side=right]:sm:max-w-none");
    expect(sheet).toHaveClass("data-[side=right]:md:max-w-xl");
  });
});
