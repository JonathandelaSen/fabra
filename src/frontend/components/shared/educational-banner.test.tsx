import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import EducationalBanner from "./educational-banner";

const messages = getMessages("en");
const BANNER_TITLE = messages.analysisFlow.extraction.banner.title;
const BANNER_DESCRIPTION = messages.analysisFlow.extraction.banner.description;
const CTA_TEXT = messages.common.actions.save;

function TestIcon({ className }: { className?: string }) {
  return <svg data-testid="test-icon" className={className} />;
}

describe("EducationalBanner", () => {
  it("renders the title and description correctly", () => {
    renderWithProviders(
      <EducationalBanner
        title={BANNER_TITLE}
        description={BANNER_DESCRIPTION}
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: BANNER_TITLE })).toBeInTheDocument();
    expect(screen.getByText(BANNER_DESCRIPTION)).toBeInTheDocument();
  });

  it("renders the optional icon and applies color classes", () => {
    renderWithProviders(
      <EducationalBanner
        title={BANNER_TITLE}
        description={BANNER_DESCRIPTION}
        icon={TestIcon}
        iconColor="text-red-500"
        iconBgColor="bg-red-100"
      />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders optional CTA element", () => {
    renderWithProviders(
      <EducationalBanner
        title={BANNER_TITLE}
        description={BANNER_DESCRIPTION}
        cta={<button type="button">{CTA_TEXT}</button>}
      />
    );

    expect(screen.getByRole("button", { name: CTA_TEXT })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <EducationalBanner
        title={BANNER_TITLE}
        description={BANNER_DESCRIPTION}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    expect(closeBtn).toBeInTheDocument();
    
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
