import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { jobMatchAnalysisModule } from "@/lib/container";
import { presentJobMatchAnalysis } from "@/modules/job-match-analysis";
import { parseScoreJobMatchAnalysisRequest } from "../../validation";
import { toJobMatchAnalysisDetailResponse } from "../../responses";
import { ok, errorResponse, notFound } from "@/modules/shared";

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
    const parsed = parseScoreJobMatchAnalysisRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }

    const updated = await jobMatchAnalysisModule
      .bindRequest(supabase)
      .scoreJobMatchAnalysis.execute({
        id: analysisId,
        userId: user.id,
        provider: parsed.value.provider,
        apiKey: parsed.value.apiKey,
        baseUrl: parsed.value.baseUrl,
        model: parsed.value.model,
        jobDescription: parsed.value.jobDescription,
        jobUrl: parsed.value.jobUrl,
      });

    if (!updated) {
      throw notFound("Analysis not found");
    }

    return ok(toJobMatchAnalysisDetailResponse(presentJobMatchAnalysis(updated)));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
