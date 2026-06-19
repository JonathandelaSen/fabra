import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import { presentPerformanceReview } from "@/backend/modules/performance-review";
import { ok } from "@/backend/modules/shared";
import type { PerformanceReviewDetailResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const body = await req.json();

    performanceReviewModule.bindRequest(supabase);
    const review =
      await performanceReviewModule.applySelfAssessmentCopyPaste.execute({
        reviewId: id,
        userId: user.id,
        envelope: body,
      });
    return ok(
      presentPerformanceReview(review) satisfies PerformanceReviewDetailResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
