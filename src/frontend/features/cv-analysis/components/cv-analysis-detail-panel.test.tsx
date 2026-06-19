import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { CVAnalysisDetailPanel } from "./cv-analysis-detail-panel";

vi.mock("./detail/analysis-view", () => ({
  default: () => <div data-testid="analysis-content" />,
}));

vi.mock("./extraction/extraction-view", () => ({
  default: () => <div data-testid="extraction-content" />,
}));

describe("CVAnalysisDetailPanel", () => {
  it("changes tabs immediately while the route update is pending", async () => {
    const setTab = vi.fn();
    const { user } = renderWithProviders(
      <CVAnalysisDetailPanel
        selectedAnalysis={{
          id: "analysis-1",
          user_id: "user-1",
          cv_id: null,
          pdf_storage_path: null,
          cv: null,
          title: "CV analysis",
          filename: "cv.pdf",
          file_size: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
          text_python: null,
          text_pdfjs: null,
          text_node: null,
          extract_error_python: null,
          extract_error_pdfjs: null,
          extract_error_node: null,
          analysis_mode: "general",
          ai_model: "mock",
          job_description: null,
          job_url: null,
          offer_status: null,
          offer_notes: null,
          offer_next_action: null,
          offer_next_action_at: null,
          ai_context: null,
          ai_score: 80,
          ai_feedback: "",
          ai_keywords: "[]",
          ai_improvements: "[]",
          job_key_data: null,
          job_keywords: null,
          cv_keywords: null,
          matching_keywords: null,
          missing_keywords: null,
          ai_analyzed_at: "2026-01-01T00:00:00.000Z",
        }}
        route={{
          mode: "detail",
          analysisId: "analysis-1",
          tab: "analysis",
          pathname: "/cv-analysis/analysis-1",
          goToList: vi.fn(),
          goToNew: vi.fn(),
          goToDetail: vi.fn(),
          replaceDetail: vi.fn(),
          setTab,
        }}
        aiProvider="mock"
        aiApiKey=""
        aiModel="mock"
        hasAIApiKey={false}
        onOpenSettings={vi.fn()}
        onRefetchAnalysis={vi.fn()}
        onScoreAnalysis={vi.fn()}
      />,
    );

    expect(screen.getByTestId("analysis-content")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /extraction/i }));

    expect(setTab).toHaveBeenCalledWith("extraction");
    expect(await screen.findByTestId("extraction-content")).toBeInTheDocument();
  });
});
