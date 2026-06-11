import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { createRequestId } from "@/lib/observability";
import { cvAnalysisModule, cvLibraryModule } from "@/lib/container";
import {
  presentCVAnalysis,
  presentCVAnalysisSummary,
} from "@/modules/cv-analysis";
import {
  toCVAnalysisDetailResponse,
  toCVAnalysisSummaryResponse,
  type CreateCVAnalysisResponse,
  type ListCVAnalysesResponse,
} from "./responses";
import { parseCreateCVAnalysisRequest } from "./validation";
import { ok, errorResponse, notFound, badRequest } from "@/modules/shared";

const ROUTE_SOURCE = "api_cv_analyses";

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const analyses = await cvAnalysisModule
      .bindRequest(supabase)
      .listCVAnalyses.execute({ userId: user.id });
    return ok(
      analyses.map((analysis) =>
        toCVAnalysisSummaryResponse(presentCVAnalysisSummary(analysis)),
      ) satisfies ListCVAnalysesResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const requestId = createRequestId("cv_analysis");

  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseCreateCVAnalysisRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const { cvId, title, context, model } = parsed.value;

    const prepared = await cvLibraryModule
      .bindRequest(supabase)
      .prepareCVAnalysisInput.execute({
        userId: user.id,
        cvId,
        requestId,
        source: ROUTE_SOURCE,
      });
    if (!prepared) {
      throw notFound("CV not found");
    }

    if (!prepared.analysisText) {
      throw badRequest("No extracted text available for this CV");
    }

    const analysis = toCVAnalysisDetailResponse(
      presentCVAnalysis(
        await cvAnalysisModule
          .bindRequest(supabase)
          .createCVAnalysis.execute({
            id: crypto.randomUUID(),
            userId: user.id,
            cvDocumentId: prepared.cv.id,
            title,
            filename: prepared.filename,
            fileSize: prepared.fileSize,
            pdfStoragePath: prepared.pdfStoragePath,
            extractedText: prepared.extractedText,
            aiModel: model,
            aiContext: context ?? null,
          }),
      ),
    );

    return ok(analysis satisfies CreateCVAnalysisResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const boundCVAnalysisModule = cvAnalysisModule.bindRequest(supabase);
    const analyses = await boundCVAnalysisModule.listCVAnalyses.execute({
      userId: user.id,
    });
    await Promise.all(
      analyses.map((analysis) =>
        boundCVAnalysisModule.deleteCVAnalysis.execute({
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
