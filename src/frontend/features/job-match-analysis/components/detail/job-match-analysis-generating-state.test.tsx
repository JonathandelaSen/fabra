import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getMessages } from "@/frontend/i18n/messages";
import { renderWithProviders } from "@/frontend/testing/render";
import { JobMatchAnalysisGeneratingState } from "./job-match-analysis-generating-state";

describe("JobMatchAnalysisGeneratingState", () => {
  it("explains that the analysis is running and links to extraction", async () => {
    const onViewExtraction = vi.fn();
    const messages = getMessages("en").analysisFlow.generating;
    const { user } = renderWithProviders(
      <JobMatchAnalysisGeneratingState onViewExtraction={onViewExtraction} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(messages.title);

    const viewExtractionButton = screen.getByRole("button", {
      name: messages.viewExtraction,
    });

    expect(viewExtractionButton).toHaveClass(
      "scale-100",
      "hover:scale-105",
      "hover:bg-action",
    );
    expect(viewExtractionButton).not.toHaveClass("hover:bg-action-hover");

    await user.click(viewExtractionButton);

    expect(onViewExtraction).toHaveBeenCalledOnce();
  });
});
