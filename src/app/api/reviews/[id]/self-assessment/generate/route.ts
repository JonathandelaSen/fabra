import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import { presentPerformanceReview } from "@/modules/performance-review";
import { errorResponse, ok, parseAIProvider } from "@/modules/shared";
import { parseGenerateSelfAssessmentRequest } from "./validation";
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
    const parsed = parseGenerateSelfAssessmentRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    performanceReviewModule.bindRequest(supabase);
    const review = await performanceReviewModule.generateSelfAssessment.execute({
      reviewId: id,
      userId: user.id,
      provider: parseAIProvider(parsed.value.provider),
      apiKey: parsed.value.apiKey,
      model: parsed.value.model,
    });
    return ok(
      presentPerformanceReview(review) satisfies PerformanceReviewDetailResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
