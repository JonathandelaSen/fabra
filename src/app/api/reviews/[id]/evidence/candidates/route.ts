import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import {
  commitmentsModule,
  performanceReviewModule,
  receivedFeedbackModule,
  workJournalModule,
} from "@/lib/container";
import { presentEvidenceCandidates } from "@/backend/modules/performance-review";
import { ok } from "@/backend/modules/shared";
import type { ListEvidenceCandidatesResponse } from "./responses";

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
    workJournalModule.bindRequest(supabase);
    receivedFeedbackModule.bindRequest(supabase);
    commitmentsModule.bindRequest(supabase);

    const candidates =
      await performanceReviewModule.listEvidenceCandidates.execute({
        reviewId: id,
        userId: user.id,
      });
    return ok(
      presentEvidenceCandidates(
        candidates,
      ) satisfies ListEvidenceCandidatesResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
