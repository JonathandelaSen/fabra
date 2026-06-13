import { describe, expect, it } from "vitest";
import { InMemoryQueryBus, InMemoryEventBus } from "@/modules/shared";
import { NoOpTelemetry } from "@/modules/shared";
import {
  createCVAnalysisModule,
  GetCVAnalysisByIdQuery,
  GetCVAnalysisByIdQueryHandler,
} from "@/modules/cv-analysis";
import {
  createJobMatchAnalysisModule,
  GetJobMatchAnalysisByIdQuery,
  GetJobMatchAnalysisByIdQueryHandler,
} from "@/modules/job-match-analysis";
import { createTestCV } from "@/modules/test-helpers/cv-fixtures";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/modules/test-helpers/setup";
import { JobAnalysisChatContextRepository } from "./job-analysis-chat-context.repository";

const supabase = getSupabaseClient();

const queryBus = new InMemoryQueryBus(new NoOpTelemetry());
const telemetry = new NoOpTelemetry();
const cvAnalysisModule = createCVAnalysisModule(
  telemetry,
  new InMemoryEventBus(telemetry),
);
const jobMatchAnalysisModule = createJobMatchAnalysisModule(
  telemetry,
  new InMemoryEventBus(telemetry),
);
queryBus.register(
  GetCVAnalysisByIdQuery.queryName,
  new GetCVAnalysisByIdQueryHandler(cvAnalysisModule.getCVAnalysisById),
);
queryBus.register(
  GetJobMatchAnalysisByIdQuery.queryName,
  new GetJobMatchAnalysisByIdQueryHandler(
    jobMatchAnalysisModule.getJobMatchAnalysisById,
  ),
);

const repo = new JobAnalysisChatContextRepository(queryBus);
repo.bindRequest(supabase);

describe("JobAnalysisChatContextRepository", () => {
  it("reads analysis context with linked CV text", async () => {
    const user = await createTestUser("job-analysis-chat-context");
    const cv = await createTestCV(supabase, {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: testLabel("cv"),
      filename: "cv.pdf",
      file_size: 123,
      pdf_storage_path: null,
      text_python: "Best CV text",
      text_pdfjs: null,
      text_node: null,
      extract_error_python: null,
      extract_error_pdfjs: null,
      extract_error_node: null,
    });

    cvAnalysisModule.bindRequest(supabase);
    jobMatchAnalysisModule.bindRequest(supabase);

    const analysis =
      await jobMatchAnalysisModule.createJobMatchAnalysis.execute({
        id: crypto.randomUUID(),
        userId: user.id,
        cvDocumentId: cv.id,
        title: testLabel("analysis"),
        filename: "cv.pdf",
        fileSize: 123,
        pdfStoragePath: null,
        extractedText: {
          textPython: "Analysis text",
          textPdfjs: null,
          textNode: null,
          extractErrorPython: null,
          extractErrorPdfjs: null,
          extractErrorNode: null,
        },
        aiModel: "model",
        jobDescription: "Job",
        jobUrl: "https://example.com",
      });

    await jobMatchAnalysisModule.updateJobMatchAnalysisAIResult.execute({
      id: analysis.toPrimitives().id,
      userId: user.id,
      aiModel: "model",
      jobDescription: "Job",
      jobUrl: "https://example.com",
      score: 91,
      feedback: "Good",
      aiKeywords: ["ts"],
      improvements: ["more"],
      jobKeyData: null,
      jobKeywords: [],
      cvKeywords: ["ts"],
      matchingKeywords: ["ts"],
      missingKeywords: [],
    });

    const context = await repo.findByAnalysisId({
      analysisId: analysis.toPrimitives().id,
      userId: user.id,
    });

    expect(context).toMatchObject({
      analysisId: analysis.toPrimitives().id,
      cvId: cv.id,
      analysisMode: "job_match",
      cvText: "Analysis text",
    });
  });
});
