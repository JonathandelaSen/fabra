import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import type { JobMatchAnalysisDetailResponse } from "../types";
import { JobMatchAnalysisMainPanel } from "./job-match-analysis-main-panel";

vi.mock("./extraction/job-match-extraction-view", () => ({
  default: () => <div data-testid="extraction-view" />,
}));

vi.mock("./detail/job-match-analysis-detail", () => ({
  default: () => <div data-testid="completed-analysis-view" />,
}));

vi.mock("./extraction/pending-job-match-analysis-view", () => ({
  PendingJobMatchAnalysisView: () => <div data-testid="pending-analysis-view" />,
}));

vi.mock("./detail/job-match-analysis-generating-state", () => ({
  JobMatchAnalysisGeneratingState: ({
    onViewExtraction,
  }: {
    onViewExtraction: () => void;
  }) => (
    <button data-testid="generating-analysis-view" onClick={onViewExtraction}>
      View extraction
    </button>
  ),
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
        isGeneratingAnalysis={false}
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
        isSavingTracking={false}
        onCreateTrackingEntry={noopAsync}
        onUpdateTrackingEntry={noopAsync}
        onDeleteTrackingEntry={noopAsync}
      />,
    );

    expect(screen.getByTestId("pending-analysis-view")).toBeInTheDocument();
    expect(screen.queryByTestId("extraction-view")).not.toBeInTheDocument();
  });

  it("shows a generating state and lets the user move to extraction", async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();

    renderWithProviders(
      <JobMatchAnalysisMainPanel
        detail={detail}
        isAnalysisView={true}
        hasScore={false}
        isGeneratingAnalysis={true}
        analysisTab="summary"
        aiApiKey=""
        hasAIApiKey={false}
        filteredInterviewQuestions={[]}
        onCopyPasteApplied={vi.fn()}
        onOpenQuestions={vi.fn()}
        onOpenSettings={vi.fn()}
        onScore={noopAsync}
        onTabChange={vi.fn()}
        onViewModeChange={onViewModeChange}
        onUpdateUrl={noopAsync}
        isSavingTracking={false}
        onCreateTrackingEntry={noopAsync}
        onUpdateTrackingEntry={noopAsync}
        onDeleteTrackingEntry={noopAsync}
      />,
    );

    expect(screen.getByTestId("generating-analysis-view")).toBeInTheDocument();
    expect(screen.queryByTestId("pending-analysis-view")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("generating-analysis-view"));

    expect(onViewModeChange).toHaveBeenCalledWith("extraction");
    await waitFor(() => {
      expect(screen.getByTestId("extraction-view")).toBeInTheDocument();
    });
  });

  it("switches tabs immediately while route navigation is pending", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <JobMatchAnalysisMainPanel
        detail={detail}
        isAnalysisView={true}
        hasScore={true}
        isGeneratingAnalysis={false}
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
        isSavingTracking={false}
        onCreateTrackingEntry={noopAsync}
        onUpdateTrackingEntry={noopAsync}
        onDeleteTrackingEntry={noopAsync}
      />,
    );

    const extractionTab = screen.getByRole("tab", {
      name: getMessages("en").analysisFlow.appShell.extractionTab,
    });
    await user.click(extractionTab);

    expect(extractionTab).toHaveAttribute("aria-selected", "true");
    await waitFor(() => {
      expect(screen.getByTestId("extraction-view")).toBeInTheDocument();
    });
  });
});
