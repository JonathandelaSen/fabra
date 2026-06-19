import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { jobMatchAnalysisModule } from "@/lib/container";
import { presentJobMatchAnalysis } from "@/backend/modules/job-match-analysis";
import { errorResponse, notFound, ok } from "@/backend/modules/shared";
import { toJobMatchAnalysisDetailResponse } from "@/app/api/job-match-analyses/responses";
import { parseApplyJobMatchAnalysisCopyPasteRequest } from "./validation";
import type { ApplyJobMatchAnalysisCopyPasteResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseApplyJobMatchAnalysisCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    jobMatchAnalysisModule.bindRequest(supabase);
    const updated =
      await jobMatchAnalysisModule.applyJobMatchScoreCopyPaste.execute({
        id,
        userId: user.id,
        parsedResult: parsed.value.parsedResult as never,
        jobDescription: parsed.value.jobDescription,
        jobUrl: parsed.value.jobUrl,
      });
    if (!updated) throw notFound("Analysis not found", ErrorCode.ANALYSIS_NOT_FOUND);

    return ok(
      toJobMatchAnalysisDetailResponse(
        presentJobMatchAnalysis(updated),
      ) satisfies ApplyJobMatchAnalysisCopyPasteResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
