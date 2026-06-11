import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import {
  presentPerformanceReview,
  presentPerformanceReviews,
} from "@/modules/performance-review";
import { created, errorResponse, ok } from "@/modules/shared";
import { parseCreatePerformanceReviewRequest } from "./validation";
import type {
  ListPerformanceReviewsResponse,
  PerformanceReviewDetailResponse,
} from "./responses";

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    performanceReviewModule.bindRequest(supabase);
    const reviews = await performanceReviewModule.listReviews.execute(user.id);
    return ok(
      presentPerformanceReviews(reviews) satisfies ListPerformanceReviewsResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseCreatePerformanceReviewRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    performanceReviewModule.bindRequest(supabase);
    const review = await performanceReviewModule.createReview.execute({
      userId: user.id,
      ...parsed.value,
    });
    return created(
      presentPerformanceReview(review) satisfies PerformanceReviewDetailResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
