import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { cvLibraryModule } from "@/lib/container";
import { ok } from "@/backend/modules/shared";
import type { DeleteCVPublicFeedbackResponse } from "./responses";
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthenticatedRequestContext(); if (!auth.ok) return auth.response;
    cvLibraryModule.bindRequest(auth.supabase);
    await cvLibraryModule.deleteCVPublicFeedback.execute({ id: (await params).id, userId: auth.user.id });
    return ok({ success: true } satisfies DeleteCVPublicFeedbackResponse);
  } catch (error) { return handleApiError(error); }
}
