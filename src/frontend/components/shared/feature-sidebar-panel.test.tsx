import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { FeatureSidebarPanel } from "./feature-sidebar-panel";

const messages = getMessages("en");
const HEADER = messages.feedbackNotes.sidebar.worklist;
const CONTENT = messages.feedbackNotes.empty;

describe("FeatureSidebarPanel", () => {
  it("renders as an aside with optional header and body content", () => {
    renderWithProviders(
      <FeatureSidebarPanel header={<h2>{HEADER}</h2>}>
        <p>{CONTENT}</p>
      </FeatureSidebarPanel>,
    );

    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: HEADER })).toBeInTheDocument();
    expect(screen.getByText(CONTENT)).toBeInTheDocument();
  });

  it("omits the header wrapper when no header is provided", () => {
    const { container } = renderWithProviders(
      <FeatureSidebarPanel>{CONTENT}</FeatureSidebarPanel>,
    );

    expect(container.querySelector(".border-b")).not.toBeInTheDocument();
  });
});
