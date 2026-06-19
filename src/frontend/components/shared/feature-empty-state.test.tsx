import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { FeatureEmptyState } from "./feature-empty-state";
import type { LucideIcon } from "lucide-react";

const messages = getMessages("en");
const EMPTY_TITLE = messages.performanceReview.empty.title;
const EMPTY_DESCRIPTION = messages.performanceReview.empty.description;
const ACTION_TEXT = messages.performanceReview.actions.create;

const TestIcon = (({ className }: { className?: string }) => {
  return <svg data-testid="test-icon" className={className} />;
}) as unknown as LucideIcon;

describe("FeatureEmptyState", () => {
  it("renders the title and icon correctly", () => {
    renderWithProviders(
      <FeatureEmptyState
        icon={TestIcon}
        title={EMPTY_TITLE}
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: EMPTY_TITLE })).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_DESCRIPTION)).not.toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    renderWithProviders(
      <FeatureEmptyState
        icon={TestIcon}
        title={EMPTY_TITLE}
        description={EMPTY_DESCRIPTION}
      />
    );

    expect(screen.getByText(EMPTY_DESCRIPTION)).toBeInTheDocument();
  });

  it("renders the custom action element when provided", () => {
    renderWithProviders(
      <FeatureEmptyState
        icon={TestIcon}
        title={EMPTY_TITLE}
        action={<button type="button">{ACTION_TEXT}</button>}
      />
    );

    expect(screen.getByRole("button", { name: ACTION_TEXT })).toBeInTheDocument();
  });

  it("applies the custom className to the wrapper", () => {
    const { container } = renderWithProviders(
      <FeatureEmptyState
        icon={TestIcon}
        title={EMPTY_TITLE}
        className="custom-class-123"
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
