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
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies correct classes for different tones", () => {
    const testTones = [
      ICON_BOX_TONES.ACTION,
      ICON_BOX_TONES.SUCCESS,
      ICON_BOX_TONES.WARNING,
      ICON_BOX_TONES.DANGER,
      ICON_BOX_TONES.INFO,
    ];

    for (const tone of testTones) {
      const { container } = renderWithProviders(<IconBox icon={TestIcon} tone={tone} />);
      expect(container.firstChild).toBeInTheDocument();
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

    expect(container.firstChild).toBeInTheDocument();
  });
});
