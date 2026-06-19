import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { JobMatchAnalysisContent } from "./job-match-analysis-content";

const noopAsync = async () => {};

describe("JobMatchAnalysisContent", () => {
  it("shows a loader instead of the empty selection text while selection is resolving", () => {
    const { container } = renderWithProviders(
      <JobMatchAnalysisContent
        analysisId={null}
        detail={null}
        isLoading={true}
        isAnalysisView={true}
        hasScore={false}
        analysisTab="summary"
        aiApiKey=""
        hasAIApiKey={false}
        filteredInterviewQuestions={[]}
        onCopyPasteApplied={vi.fn()}
        onOpenQuestions={vi.fn()}
        onOpenSettings={vi.fn()}
        onScore={noopAsync}
        onTabChange={vi.fn()}
        onViewModeChange={vi.fn()}
        onInterviewQuestionCreated={vi.fn()}
        onUpdateUrl={noopAsync}
        onUpdateTracking={noopAsync}
      />,
    );

    expect(
      screen.queryByText("No analysis to show"),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
