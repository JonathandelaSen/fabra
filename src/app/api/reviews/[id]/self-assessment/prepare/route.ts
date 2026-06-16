import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import { ok } from "@/modules/shared";
import type { SelfAssessmentCopyPasteResponse } from "./responses";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    performanceReviewModule.bindRequest(supabase);
    const result =
      await performanceReviewModule.prepareSelfAssessmentCopyPaste.execute({
        reviewId: id,
        userId: user.id,
      });
    return ok(result satisfies SelfAssessmentCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
