import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { IconBox, ICON_BOX_TONES } from "./icon-box";

import type { LucideIcon } from "lucide-react";

const TestIcon = (({ className }: { className?: string }) => {
  return <svg data-testid="test-icon" className={className} />;
}) as unknown as LucideIcon;

describe("IconBox", () => {
  it("renders the icon correctly", () => {
    renderWithProviders(<IconBox icon={TestIcon} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies neutral class by default", () => {
    const { container } = renderWithProviders(<IconBox icon={TestIcon} />);
    expect(container.firstChild).toHaveClass(
      "border-transparent",
      "bg-panel-control",
      "text-text-muted"
    );
  });

  it("applies correct classes for different tones", () => {
    const testTones = [
      { tone: ICON_BOX_TONES.ACTION, expected: ["border-action-border", "bg-action-soft", "text-action-text"] },
      { tone: ICON_BOX_TONES.SUCCESS, expected: ["border-success-border", "bg-success-soft", "text-success-text"] },
      { tone: ICON_BOX_TONES.WARNING, expected: ["border-warning-border", "bg-warning-soft", "text-warning-text"] },
      { tone: ICON_BOX_TONES.DANGER, expected: ["border-danger-border", "bg-danger-soft", "text-danger-text"] },
      { tone: ICON_BOX_TONES.INFO, expected: ["border-info-border", "bg-info-soft", "text-info-text"] },
    ];

    for (const { tone, expected } of testTones) {
      const { container } = renderWithProviders(<IconBox icon={TestIcon} tone={tone} />);
      for (const cls of expected) {
        expect(container.firstChild).toHaveClass(cls);
      }
    }
  });

  it("forwards custom className and iconClassName", () => {
    const { container } = renderWithProviders(
      <IconBox
        icon={TestIcon}
        className="custom-box-class"
        iconClassName="custom-icon-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-box-class");
    expect(screen.getByTestId("test-icon")).toHaveClass("custom-icon-class");
  });
});
