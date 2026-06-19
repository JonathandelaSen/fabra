import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { SectionCard } from "./section-card";
import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

const TestIcon = forwardRef<SVGSVGElement, any>(({ className }, ref) => (
  <svg ref={ref} data-testid="test-icon" className={className} />
)) as LucideIcon;
TestIcon.displayName = "TestIcon";

describe("SectionCard", () => {
  it("renders children without title or actions", () => {
    renderWithProviders(
      <SectionCard>
        <div data-testid="child-content">Content</div>
      </SectionCard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByTestId("child-content").parentElement).toHaveClass("p-5");
  });

  it("renders with a title and an icon", () => {
    renderWithProviders(
      <SectionCard title="My Section" icon={TestIcon}>
        Content
      </SectionCard>
    );

    expect(screen.getByText("My Section")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    renderWithProviders(
      <SectionCard actions={<button data-testid="action-button">Action</button>}>
        Content
      </SectionCard>
    );

    expect(screen.getByTestId("action-button")).toBeInTheDocument();
  });

  it("applies a custom className to the wrapper", () => {
    const { container } = renderWithProviders(
      <SectionCard className="custom-class">Content</SectionCard>
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("removes default padding when noPadding is true", () => {
    const { container } = renderWithProviders(
      <SectionCard noPadding>Content</SectionCard>
    );

    expect(container.firstChild).not.toHaveClass("p-5");
  });
});
