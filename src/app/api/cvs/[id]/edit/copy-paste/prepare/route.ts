import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { getLatestRecommendationAnalysisForCV } from "@/lib/analysis-queries";
import { cvLibraryModule } from "@/lib/container";
import { errorResponse, notFound, ok } from "@/modules/shared";
import { parsePrepareCVEditorCopyPasteRequest } from "./validation";
import type { PrepareCVEditorCopyPasteResponse } from "./responses";

function parseStringArray(value: string | null): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePrepareCVEditorCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    cvLibraryModule.bindRequest(supabase);

    const document = await cvLibraryModule.getCVDocument.execute({
      id,
      userId: user.id,
    });
    if (!document) throw notFound("Template CV not found", ErrorCode.TEMPLATE_CV_NOT_FOUND);

    const primitives = document.toPrimitives();
    const sourceCvId = primitives.sourceCvId;
    const latestAnalysis = sourceCvId
      ? await getLatestRecommendationAnalysisForCV(supabase, sourceCvId, user.id)
      : null;
    const recommendations = latestAnalysis
      ? [
          ...parseStringArray(latestAnalysis.ai_improvements),
          ...parseStringArray(latestAnalysis.missing_keywords).map(
            (keyword) =>
              `Consider adding or strengthening this missing keyword if it is truthful: ${keyword}`,
          ),
        ]
      : [];

    const result = await cvLibraryModule.prepareCVEditorCopyPaste.execute({
      cvDocumentId: id,
      userId: user.id,
      instruction: parsed.value.instruction,
      templateId: parsed.value.templateId,
      locale: parsed.value.locale,
      recommendations,
    });
    if (!result) throw notFound("Template CV not found", ErrorCode.TEMPLATE_CV_NOT_FOUND);

    return ok(result.toPrimitives() satisfies PrepareCVEditorCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
