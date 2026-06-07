import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import type { JobMatchAnalysisDetailResponse } from "../types";
import { JobMatchAnalysisMainPanel } from "./job-match-analysis-main-panel";

vi.mock("./job-match-extraction-view", () => ({
  default: () => <div data-testid="extraction-view" />,
}));

vi.mock("./job-match-analysis-detail", () => ({
  default: () => <div data-testid="completed-analysis-view" />,
}));

vi.mock("./pending-job-match-analysis-view", () => ({
  PendingJobMatchAnalysisView: () => <div data-testid="pending-analysis-view" />,
}));

const detail = {
  id: "analysis-id",
} as JobMatchAnalysisDetailResponse;

const noopAsync = async () => {};

describe("JobMatchAnalysisMainPanel", () => {
  it("shows the pending analysis flow without repeating extraction content", () => {
    renderWithProviders(
      <JobMatchAnalysisMainPanel
        detail={detail}
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
        onUpdateUrl={noopAsync}
        onUpdateTracking={noopAsync}
      />,
    );

    expect(screen.getByTestId("pending-analysis-view")).toBeInTheDocument();
    expect(screen.queryByTestId("extraction-view")).not.toBeInTheDocument();
  });
});
