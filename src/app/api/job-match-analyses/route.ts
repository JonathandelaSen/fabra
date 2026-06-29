import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { createRequestId } from "@/lib/observability";
import {
  cvLibraryModule,
  jobMatchAnalysisModule,
  selectionProcessModule,
} from "@/lib/container";
import {
  presentJobMatchAnalysis,
  presentJobMatchAnalysisSummary,
} from "@/backend/modules/job-match-analysis";
import { presentFollowUpEntry } from "@/backend/modules/selection-process";
import { parseCreateJobMatchAnalysisRequest } from "./validation";
import {
  toJobMatchAnalysisSummaryResponse,
  toJobMatchAnalysisDetailResponse,
} from "./responses";
import {
  ok,
  created,
  errorResponse,
  notFound,
  badRequest,
} from "@/backend/modules/shared";

const ROUTE_SOURCE = "api_job_match_analyses";

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    jobMatchAnalysisModule.bindRequest(supabase);
    selectionProcessModule.bindRequest(supabase);
    const analyses = await jobMatchAnalysisModule.listJobMatchAnalyses.execute({
      userId: user.id,
    });
    const response = analyses.map((a) =>
      toJobMatchAnalysisSummaryResponse(presentJobMatchAnalysisSummary(a)),
    );
    const analysisIds = response.map((analysis) => analysis.id);

    if (analysisIds.length > 0) {
      const tracking =
        await selectionProcessModule.listFollowUpTrackingByAnalyses.execute({
          analysisIds,
          userId: user.id,
        });
      const trackingByAnalysisId = new Map(
        tracking.flatMap((item) => {
          const primitives = item.followUp.toPrimitives();
          return primitives.sourceJobMatchAnalysisId
            ? [[primitives.sourceJobMatchAnalysisId, item] as const]
            : [];
        }),
      );

      return ok(
        response.map((analysis) => {
          const tracking = trackingByAnalysisId.get(analysis.id);
          return tracking
            ? {
                ...analysis,
                offerStatus: tracking.followUp.toPrimitives().status,
                offerNextActionAt:
                  tracking.entries[0]?.toPrimitives().nextActionAt ?? null,
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

    cvLibraryModule.bindRequest(supabase);
    jobMatchAnalysisModule.bindRequest(supabase);
    selectionProcessModule.bindRequest(supabase);

    const prepared = await cvLibraryModule.prepareCVAnalysisInput.execute({
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
      await jobMatchAnalysisModule.createJobMatchAnalysis.execute({
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
    const initialEntry =
      await selectionProcessModule.createFollowUpEntryByAnalysis.execute({
        analysisId: analysis.id,
        userId: user.id,
        status: "interesting",
        occurredAt: analysis.createdAt,
        updateCurrentStatus: false,
      });
    if (!initialEntry) {
      throw notFound("Could not create offer tracking");
    }
    const presentedInitialEntry = presentFollowUpEntry(initialEntry);

    return created({
      ...analysis,
      offerStatus: "interesting",
      offerNotes: null,
      offerNextAction: null,
      offerNextActionAt: null,
      tracking: {
        currentStatus: "interesting",
        entries: [presentedInitialEntry],
      },
    });
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
