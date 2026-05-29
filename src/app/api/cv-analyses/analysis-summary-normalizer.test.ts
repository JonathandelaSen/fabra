import { describe, expect, it } from "vitest";
import { normalizeAnalysisSummaries } from "@/components/shell/analysis-summary-normalizer";

describe("normalizeAnalysisSummaries", () => {
  it("keeps legacy CV analysis summaries and maps camelCase job-match summaries", () => {
    const summaries = normalizeAnalysisSummaries([
      {
        id: "cv-analysis-1",
        cv_id: "cv-1",
        title: "Análisis CV 1",
        filename: "cv.pdf",
        created_at: "2026-05-05T15:01:18.321773+00:00",
        analysis_mode: "general",
        ai_score: 65,
        ai_analyzed_at: "2026-05-05T15:01:38.481+00:00",
        job_url: null,
        offer_status: null,
        offer_next_action_at: null,
      },
      {
        id: "job-analysis-1",
        cvId: "cv-1",
        title: "Oferta",
        filename: "offer.pdf",
        createdAt: "2026-05-06T15:01:18.321773+00:00",
        aiScore: 72,
        aiAnalyzedAt: "2026-05-06T15:01:38.481+00:00",
        jobUrl: "https://example.com/job",
        offerStatus: "interesting",
        offerNextActionAt: null,
      },
    ]);

    expect(summaries).toEqual([
      {
        id: "cv-analysis-1",
        cv_id: "cv-1",
        title: "Análisis CV 1",
        filename: "cv.pdf",
        created_at: "2026-05-05T15:01:18.321773+00:00",
        analysis_mode: "general",
        ai_score: 65,
        ai_analyzed_at: "2026-05-05T15:01:38.481+00:00",
        job_url: null,
        offer_status: null,
        offer_next_action_at: null,
      },
      {
        id: "job-analysis-1",
        cv_id: "cv-1",
        title: "Oferta",
        filename: "offer.pdf",
        created_at: "2026-05-06T15:01:18.321773+00:00",
        analysis_mode: "job_match",
        ai_score: 72,
        ai_analyzed_at: "2026-05-06T15:01:38.481+00:00",
        job_url: "https://example.com/job",
        offer_status: "interesting",
        offer_next_action_at: null,
      },
    ]);
  });
});
