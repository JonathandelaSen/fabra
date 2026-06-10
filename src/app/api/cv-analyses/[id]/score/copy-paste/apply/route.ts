import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvAnalysisModule } from "@/lib/container";
import { presentCVAnalysis } from "@/modules/cv-analysis";
import { errorResponse, notFound, ok } from "@/modules/shared";
import {
  toCVAnalysisDetailResponse,
  type ScoreCVAnalysisResponse,
} from "@/app/api/cv-analyses/responses";
import { parseApplyCVAnalysisCopyPasteRequest } from "./validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseApplyCVAnalysisCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    cvAnalysisModule.bindRequest(supabase);
    const updated = await cvAnalysisModule.applyCVScoreCopyPaste.execute({
      id,
      userId: user.id,
      parsedResult: parsed.value.parsedResult,
    });
    if (!updated) throw notFound("Analysis not found");

    return ok(
      toCVAnalysisDetailResponse(presentCVAnalysis(updated)) satisfies ScoreCVAnalysisResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
