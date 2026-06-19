import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import HowAtsWorksEducationBanner from "./how-ats-works-education-banner";

const messages = getMessages("en");
const BANNER_TITLE = messages.analysisFlow.extraction.banner.title;
const BANNER_DESCRIPTION = messages.analysisFlow.extraction.banner.description;

describe("HowAtsWorksEducationBanner", () => {
  it("renders the educational banner with correct translations", () => {
    renderWithProviders(<HowAtsWorksEducationBanner />);

    expect(screen.getByRole("heading", { level: 3, name: BANNER_TITLE })).toBeInTheDocument();
    expect(screen.getByText(BANNER_DESCRIPTION)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(<HowAtsWorksEducationBanner onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    expect(closeBtn).toBeInTheDocument();

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
