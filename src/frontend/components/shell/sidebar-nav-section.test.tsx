import { forwardRef } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LucideIcon } from "lucide-react";
import { renderWithProviders } from "@/frontend/testing/render";
import SidebarNavSection from "./sidebar-nav-section";

const TestIcon = forwardRef<SVGSVGElement, { className?: string }>(
  ({ className }, ref) => (
    <svg ref={ref} data-testid="section-icon" className={className} />
  ),
) as LucideIcon;
TestIcon.displayName = "TestIcon";

function createItems() {
  return [
    { icon: TestIcon, label: "Overview", active: true, onClick: vi.fn() },
    { icon: TestIcon, label: "Reports", active: false, onClick: vi.fn() },
  ];
}

function renderSection(
  overrides: Partial<React.ComponentProps<typeof SidebarNavSection>> = {},
) {
  const props: React.ComponentProps<typeof SidebarNavSection> = {
    icon: TestIcon,
    label: "Insights",
    collapsed: false,
    open: true,
    onToggle: vi.fn(),
    items: createItems(),
    ...overrides,
  };
  return { props, ...renderWithProviders(<SidebarNavSection {...props} />) };
}

describe("SidebarNavSection", () => {
  it("shows the header and items when expanded and open", () => {
    renderSection({ open: true, collapsed: false });

    expect(
      screen.getByRole("button", { name: /Insights/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });

  it("calls onToggle when the header is clicked", async () => {
    const { props, user } = renderSection();

    await user.click(screen.getByRole("button", { name: /Insights/ }));

    expect(props.onToggle).toHaveBeenCalledOnce();
  });

  it("hides items when expanded but closed", () => {
    renderSection({ open: false, collapsed: false });

    expect(
      screen.getByRole("button", { name: /Insights/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Reports")).not.toBeInTheDocument();
  });

  it("hides the header but still shows items when collapsed and closed", () => {
    renderSection({ open: false, collapsed: true });

    expect(
      screen.queryByRole("button", { name: /Insights/ }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Overview" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reports" })).toBeInTheDocument();
  });

  it("forwards clicks to the matching item handler", async () => {
    const { props, user } = renderSection();

    await user.click(screen.getByText("Reports"));

    expect(props.items[1].onClick).toHaveBeenCalledOnce();
    expect(props.items[0].onClick).not.toHaveBeenCalled();
  });
});
