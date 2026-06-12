import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { IconLabelBadge } from "./icon-label-badge";
import { LABEL_BADGE_SIZES } from "./label-badge";
import type { LucideIcon } from "lucide-react";

const messages = getMessages("en");
const BADGE_TEXT = messages.settings.badge;

const TestIcon = (({ className }: { className?: string }) => {
  return <svg data-testid="test-icon" className={className} />;
}) as unknown as LucideIcon;

describe("IconLabelBadge", () => {
  it("renders text label and custom title attributes", () => {
    renderWithProviders(<IconLabelBadge text={BADGE_TEXT} />);

    const badge = screen.getByText(BADGE_TEXT);
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveAttribute("title", BADGE_TEXT);
  });

  it("does not render icon when not provided", () => {
    renderWithProviders(<IconLabelBadge text={BADGE_TEXT} />);
    expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
  });

  it("renders the icon when provided", () => {
    renderWithProviders(<IconLabelBadge text={BADGE_TEXT} icon={TestIcon} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies the appropriate size classes for different sizes", () => {
    const { container: containerXS } = renderWithProviders(
      <IconLabelBadge text={BADGE_TEXT} size={LABEL_BADGE_SIZES.XS} />
    );
    expect(containerXS.firstChild).toBeInTheDocument();

    const { container: containerSM } = renderWithProviders(
      <IconLabelBadge text={BADGE_TEXT} size={LABEL_BADGE_SIZES.SM} />
    );
    expect(containerSM.firstChild).toBeInTheDocument();

    const { container: containerMD } = renderWithProviders(
      <IconLabelBadge text={BADGE_TEXT} size={LABEL_BADGE_SIZES.MD} />
    );
    expect(containerMD.firstChild).toBeInTheDocument();
  });

  it("applies the appropriate icon size classes", () => {
    renderWithProviders(
      <IconLabelBadge text={BADGE_TEXT} icon={TestIcon} size={LABEL_BADGE_SIZES.MD} />
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("forwards custom className", () => {
    const { container } = renderWithProviders(
      <IconLabelBadge text={BADGE_TEXT} className="custom-badge-class" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
