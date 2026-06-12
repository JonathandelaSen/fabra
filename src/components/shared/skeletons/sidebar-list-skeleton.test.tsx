import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { SidebarListSkeleton } from "./sidebar-list-skeleton";

describe("SidebarListSkeleton", () => {
  it("renders correct number of default skeleton items", () => {
    const { container } = renderWithProviders(<SidebarListSkeleton />);
    
    // Each skeleton item is wrapped in a div with "mb-2 w-full rounded-xl border border-transparent p-3.5"
    // Let's count how many such wrappers are created (default should be 5)
    const items = container.querySelectorAll(".mb-2.w-full");
    expect(items.length).toBe(5);
  });

  it("renders requested number of skeleton items", () => {
    const { container } = renderWithProviders(<SidebarListSkeleton itemCount={3} />);
    
    const items = container.querySelectorAll(".mb-2.w-full");
    expect(items.length).toBe(3);
  });
});
