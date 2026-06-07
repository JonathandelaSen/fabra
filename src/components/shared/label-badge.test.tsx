import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import {
  LABEL_BADGE_SIZES,
  LABEL_BADGE_TONES,
  LabelBadge,
} from "./label-badge";

function TestIcon({ className }: { className?: string }) {
  return <svg data-testid="badge-icon" className={className} />;
}

const LABEL = getMessages("en").common.states.configured;
const CHILD_LABEL = getMessages("en").common.states.notConfigured;

describe("LabelBadge", () => {
  it("renders a label prop with the default shared presentation", () => {
    renderWithProviders(<LabelBadge label={LABEL} />);

    expect(screen.getByText(LABEL).parentElement).toHaveClass(
      "font-medium",
      "text-sm",
      "bg-panel-subtle",
    );
  });

  it("prefers children and applies requested tone, size, and icon", () => {
    renderWithProviders(
      <LabelBadge
        label={LABEL}
        icon={TestIcon}
        strong
        size={LABEL_BADGE_SIZES.MD}
        tone={LABEL_BADGE_TONES.SUCCESS}
      >
        {CHILD_LABEL}
      </LabelBadge>,
    );

    expect(screen.queryByText(LABEL)).not.toBeInTheDocument();
    expect(screen.getByText(CHILD_LABEL).parentElement).toHaveClass(
      "font-semibold",
      "text-md",
      "text-emerald-400",
    );
    expect(screen.getByTestId("badge-icon")).toHaveClass("h-3.5", "w-3.5");
  });
});
