import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvAnalysisModule } from "@/lib/container";
import { errorResponse, notFound, ok } from "@/modules/shared";
import { parsePreviewCVAnalysisCopyPasteRequest } from "./validation";
import type { PreviewCVAnalysisCopyPasteResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePreviewCVAnalysisCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    cvAnalysisModule.bindRequest(supabase);
    const result = await cvAnalysisModule.previewCVScoreCopyPaste.execute({
      id,
      userId: user.id,
      rawResponse: parsed.value.rawResponse,
      interactionId: parsed.value.interactionId,
      attemptId: parsed.value.attemptId,
    });
    if (!result) throw notFound("Analysis not found");

    return ok(result satisfies PreviewCVAnalysisCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
