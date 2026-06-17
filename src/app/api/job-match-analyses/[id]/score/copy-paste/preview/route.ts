import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { jobMatchAnalysisModule } from "@/lib/container";
import { errorResponse, notFound, ok } from "@/modules/shared";
import { parsePreviewJobMatchAnalysisCopyPasteRequest } from "./validation";
import type { PreviewJobMatchAnalysisCopyPasteResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePreviewJobMatchAnalysisCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    jobMatchAnalysisModule.bindRequest(supabase);
    const result =
      await jobMatchAnalysisModule.previewJobMatchScoreCopyPaste.execute({
        id,
        userId: user.id,
        rawResponse: parsed.value.rawResponse,
      });
    if (!result) throw notFound("Analysis not found", ErrorCode.ANALYSIS_NOT_FOUND);

    return ok(result.toPrimitives() satisfies PreviewJobMatchAnalysisCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
