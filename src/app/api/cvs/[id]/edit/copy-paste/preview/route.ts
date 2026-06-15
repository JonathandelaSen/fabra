import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvLibraryModule } from "@/lib/container";
import { errorResponse, notFound, ok } from "@/modules/shared";
import { parsePreviewCVEditorCopyPasteRequest } from "../../../../validation";
import type { PreviewCVEditorCopyPasteResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePreviewCVEditorCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    cvLibraryModule.bindRequest(supabase);
    const result = await cvLibraryModule.previewCVEditorCopyPaste.execute({
      cvDocumentId: id,
      userId: user.id,
      rawResponse: parsed.value.rawResponse,
    });
    if (!result) throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);

    return ok(result satisfies PreviewCVEditorCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
