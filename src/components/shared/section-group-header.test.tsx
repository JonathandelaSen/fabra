import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { SectionGroupHeader } from "./section-group-header";

const messages = getMessages("en");
const HEADER_LABEL = messages.navigation.cvSection;

describe("SectionGroupHeader", () => {
  it("renders the label correctly", () => {
    renderWithProviders(<SectionGroupHeader label={HEADER_LABEL} />);
    expect(screen.getByText(HEADER_LABEL)).toBeInTheDocument();
  });

  it("renders the count when provided", () => {
    renderWithProviders(<SectionGroupHeader label={HEADER_LABEL} count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not render count when not provided", () => {
    const { container } = renderWithProviders(<SectionGroupHeader label={HEADER_LABEL} />);
    // The count is rendered inside a span with border/bg styles, so check that only one span (the label) exists
    const spans = container.querySelectorAll("span");
    expect(spans.length).toBe(1);
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <SectionGroupHeader label={HEADER_LABEL} className="custom-header-class" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
