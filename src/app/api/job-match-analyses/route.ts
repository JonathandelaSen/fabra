import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { createRequestId } from "@/lib/observability";
import { cvLibraryModule, jobMatchAnalysisModule } from "@/lib/container";
import {
  presentJobMatchAnalysis,
  presentJobMatchAnalysisSummary,
} from "@/backend/modules/job-match-analysis";
import { parseCreateJobMatchAnalysisRequest } from "./validation";
import {
  toJobMatchAnalysisSummaryResponse,
  toJobMatchAnalysisDetailResponse,
  type JobMatchAnalysisOfferStatus,
} from "./responses";
import { ok, errorResponse, notFound, badRequest } from "@/backend/modules/shared";

const ROUTE_SOURCE = "api_job_match_analyses";

interface FollowUpTrackingRow {
  source_job_match_analysis_id: string;
  status: JobMatchAnalysisOfferStatus;
  next_action_at: string | null;
}

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const analyses = await jobMatchAnalysisModule
      .bindRequest(supabase)
      .listJobMatchAnalyses.execute({ userId: user.id });
    const response = analyses.map((a) =>
      toJobMatchAnalysisSummaryResponse(presentJobMatchAnalysisSummary(a)),
    );
    const analysisIds = response.map((analysis) => analysis.id);

    if (analysisIds.length > 0) {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("source_job_match_analysis_id, status, next_action_at")
        .eq("user_id", user.id)
        .in("source_job_match_analysis_id", analysisIds);

      if (error) throw error;

      const trackingByAnalysisId = new Map(
        ((data ?? []) as FollowUpTrackingRow[])
          .filter((row) => row.source_job_match_analysis_id)
          .map((row) => [row.source_job_match_analysis_id, row]),
      );

      return ok(
        response.map((analysis) => {
          const tracking = trackingByAnalysisId.get(analysis.id);
          return tracking
            ? {
                ...analysis,
                offerStatus: tracking.status,
                offerNextActionAt: tracking.next_action_at,
              }
            : analysis;
        }),
      );
    }

    return ok(response);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const requestId = createRequestId("job_match_analysis");

  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseCreateJobMatchAnalysisRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const { cvId, title, jobDescription, jobUrl, model } = parsed.value;

    const prepared = await cvLibraryModule
      .bindRequest(supabase)
      .prepareCVAnalysisInput.execute({
        userId: user.id,
        cvId,
        requestId,
        source: ROUTE_SOURCE,
      });
    if (!prepared) {
      throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);
    }

    if (!prepared.analysisText) {
      throw badRequest("No extracted text available for this CV", ErrorCode.CV_NO_EXTRACTED_TEXT);
    }

    const analysisLegacy = presentJobMatchAnalysis(
      await jobMatchAnalysisModule
        .bindRequest(supabase)
        .createJobMatchAnalysis.execute({
          id: crypto.randomUUID(),
          userId: user.id,
          cvDocumentId: prepared.cv.id,
          title,
          filename: prepared.filename,
          fileSize: prepared.fileSize,
          pdfStoragePath: prepared.pdfStoragePath,
          extractedText: prepared.extractedText,
          aiModel: model,
          jobDescription,
          jobUrl,
        }),
    );
    const analysis = toJobMatchAnalysisDetailResponse(analysisLegacy);

    return ok(analysis);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const boundJobMatchAnalysisModule =
      jobMatchAnalysisModule.bindRequest(supabase);
    const analyses = await boundJobMatchAnalysisModule.listJobMatchAnalyses.execute({
      userId: user.id,
    });
    await Promise.all(
      analyses.map((analysis) =>
        boundJobMatchAnalysisModule.deleteJobMatchAnalysis.execute({
          id: analysis.toPrimitives().id,
          userId: user.id,
        }),
      ),
    );
    return ok({ success: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
