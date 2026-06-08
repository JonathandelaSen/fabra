import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
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

  it("switches tabs immediately while route navigation is pending", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <JobMatchAnalysisMainPanel
        detail={detail}
        isAnalysisView={true}
        hasScore={true}
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
