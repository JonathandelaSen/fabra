import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import SidebarNavItem from "./sidebar-nav-item";
import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

const TestIcon = forwardRef<SVGSVGElement, any>(({ className }, ref) => (
  <svg ref={ref} data-testid="nav-icon" className={className} />
)) as LucideIcon;
TestIcon.displayName = "TestIcon";

describe("SidebarNavItem", () => {
  it("renders correctly in an expanded state", () => {
    const onClick = vi.fn();
    renderWithProviders(
      <SidebarNavItem
        icon={TestIcon}
        label="Dashboard"
        active={false}
        collapsed={false}
        onClick={onClick}
      />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-icon")).toBeInTheDocument();
    
    // Non-active state classes
    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-text-muted");
    expect(button).not.toHaveAttribute("title"); // Not collapsed, so no title attribute
  });

  it("renders correctly in a collapsed state", () => {
    const onClick = vi.fn();
    renderWithProviders(
      <SidebarNavItem
        icon={TestIcon}
        label="Settings"
        active={false}
        collapsed={true}
        onClick={onClick}
      />
    );

    // Label should not be rendered inside a span, but as a title on the button
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Settings");
    expect(button).toHaveClass("justify-center", "p-2");
  });

  it("applies active styles when active is true", () => {
    const onClick = vi.fn();
    renderWithProviders(
      <SidebarNavItem
        icon={TestIcon}
        label="Profile"
        active={true}
        collapsed={false}
        onClick={onClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("sidebar-nav-active", "text-sidebar-accent-foreground");
    expect(screen.getByTestId("nav-icon")).toHaveClass("text-action");
  });

  it("calls the onClick handler when clicked", () => {
    const onClick = vi.fn();
    renderWithProviders(
      <SidebarNavItem
        icon={TestIcon}
        label="Click Me"
        active={false}
        collapsed={false}
        onClick={onClick}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
