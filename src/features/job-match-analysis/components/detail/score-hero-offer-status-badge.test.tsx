import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import {
  ScoreHeroOfferStatusBadge,
  STATUS_CONFIG,
} from "./score-hero-offer-status-badge";

const messages = getMessages("en");
const offerStatuses = messages.navigation.offerStatuses;
const STATUS_LABEL = messages.analysisDetail.tracking.status;

describe("ScoreHeroOfferStatusBadge", () => {
  it("renders the localized label for the provided status", () => {
    renderWithProviders(
      <ScoreHeroOfferStatusBadge offerStatus="offer" tabValue="offer" />,
    );

    expect(screen.getByText(`${STATUS_LABEL}:`)).toBeInTheDocument();
    expect(screen.getByText(offerStatuses.offer)).toBeInTheDocument();
  });

  it("falls back to the 'interesting' status when none is provided", () => {
    renderWithProviders(
      <ScoreHeroOfferStatusBadge offerStatus={null} tabValue="offer" />,
    );

    expect(screen.getByText(offerStatuses.interesting)).toBeInTheDocument();
  });

  it("notifies the requested tab when clicked", async () => {
    const onTabChange = vi.fn();
    const { user } = renderWithProviders(
      <ScoreHeroOfferStatusBadge
        offerStatus="applied"
        tabValue="tracking"
        onTabChange={onTabChange}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(onTabChange).toHaveBeenCalledWith("tracking");
  });

  it("does not throw when clicked without an onTabChange handler", async () => {
    const { user } = renderWithProviders(
      <ScoreHeroOfferStatusBadge offerStatus="applied" tabValue="offer" />,
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders the ping indicator only for statuses configured with one", () => {
    const { container, rerender } = renderWithProviders(
      <ScoreHeroOfferStatusBadge offerStatus="interview" tabValue="offer" />,
    );
    expect(STATUS_CONFIG.interview.pingBg).not.toBeNull();
    expect(container.querySelector(".animate-ping")).toBeInTheDocument();

    rerender(
      <ScoreHeroOfferStatusBadge offerStatus="applied" tabValue="offer" />,
    );
    expect(STATUS_CONFIG.applied.pingBg).toBeNull();
    expect(container.querySelector(".animate-ping")).not.toBeInTheDocument();
  });
});
