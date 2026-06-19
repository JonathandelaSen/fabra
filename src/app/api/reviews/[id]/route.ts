import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { performanceReviewModule } from "@/lib/container";
import {
  PerformanceReviewNotFoundError,
  presentPerformanceReview,
} from "@/backend/modules/performance-review";
import { errorResponse, ok } from "@/backend/modules/shared";
import { parseUpdatePerformanceReviewRequest } from "./validation";
import type { PerformanceReviewDetailResponse } from "./responses";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    performanceReviewModule.bindRequest(supabase);
    const review = await performanceReviewModule.getReview.execute({
      id,
      userId: user.id,
    });
    return ok(
      presentPerformanceReview(review) satisfies PerformanceReviewDetailResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const body = await req.json();
    const parsed = parseUpdatePerformanceReviewRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    performanceReviewModule.bindRequest(supabase);
    const review = await performanceReviewModule.updateReview.execute({
      id,
      userId: user.id,
      ...parsed.value,
    });
    return ok(
      presentPerformanceReview(review) satisfies PerformanceReviewDetailResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    performanceReviewModule.bindRequest(supabase);
    const result = await performanceReviewModule.deleteReview.execute({
      id,
      userId: user.id,
    });
    if (!result.toPrimitives()) throw new PerformanceReviewNotFoundError();
    return ok({ ok: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
