import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { cvLibraryModule } from "@/lib/container";
import { ok } from "@/backend/modules/shared";
import type { ListCVPublicFeedbackResponse } from "./responses";
export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedRequestContext(); if (!auth.ok) return auth.response;
    cvLibraryModule.bindRequest(auth.supabase);
    const cvId = new URL(req.url).searchParams.get("cvId");
    if (!cvId) return ok([] satisfies ListCVPublicFeedbackResponse);
    const feedback = await cvLibraryModule.listCVPublicFeedback.execute({ cvId, userId: auth.user.id });
    return ok(feedback.map((item) => { const p = item.toPrimitives(); return { id: p.id, cvId: p.cvId, giverName: p.giverName, giverContext: p.giverContext, feedbackText: p.feedbackText, createdAt: p.createdAt }; }) satisfies ListCVPublicFeedbackResponse);
  } catch (error) { return handleApiError(error); }
}
