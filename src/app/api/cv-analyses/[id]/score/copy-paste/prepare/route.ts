import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvAnalysisModule } from "@/lib/container";
import { errorResponse, notFound, ok } from "@/modules/shared";
import { parsePrepareCVAnalysisCopyPasteRequest } from "./validation";
import type { PrepareCVAnalysisCopyPasteResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePrepareCVAnalysisCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    cvAnalysisModule.bindRequest(supabase);
    const result = await cvAnalysisModule.prepareCVScoreCopyPaste.execute({
      id,
      userId: user.id,
      additionalContext: parsed.value.additionalContext,
      language: parsed.value.language,
    });
    if (!result) throw notFound("Analysis not found");

    return ok(result satisfies PrepareCVAnalysisCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
