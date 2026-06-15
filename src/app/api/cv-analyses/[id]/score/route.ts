import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvAnalysisModule } from "@/lib/container";
import { presentCVAnalysis } from "@/modules/cv-analysis";
import { parseScoreCVAnalysisRequest } from "../../validation";
import {
  toCVAnalysisDetailResponse,
  type ScoreCVAnalysisResponse,
} from "../../responses";
import { ok, errorResponse, notFound } from "@/modules/shared";
import { createRequestId } from "@/lib/observability";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: analysisId } = await params;

  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseScoreCVAnalysisRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }

    const updated = await cvAnalysisModule
      .bindRequest(supabase)
      .scoreCVAnalysis.execute({
        id: analysisId,
        userId: user.id,
        provider: parsed.value.provider,
        apiKey: parsed.value.apiKey,
        baseUrl: parsed.value.baseUrl,
        model: parsed.value.model,
        additionalContext: parsed.value.additionalContext,
        language: parsed.value.language,
        requestId: createRequestId("cv_score"),
      });

    if (!updated) {
      throw notFound("Analysis not found", ErrorCode.ANALYSIS_NOT_FOUND);
    }

    return ok(
      toCVAnalysisDetailResponse(presentCVAnalysis(updated)) satisfies ScoreCVAnalysisResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
