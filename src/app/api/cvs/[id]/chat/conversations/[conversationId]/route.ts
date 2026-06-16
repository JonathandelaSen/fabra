import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { createRequestId } from "@/lib/observability";
import { cvChatModule } from "@/lib/container";
import { presentConversation } from "@/modules/cv-chat";
import { errorResponse, ok } from "@/modules/shared";
import type { CVChatConversationMutationResponse } from "./responses";
import { parseRenameCVChatConversationRequest } from "./validation";

type Params = { params: Promise<{ id: string; conversationId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;
    const { id, conversationId } = await params;
    const parsed = parseRenameCVChatConversationRequest(await req.json());
    if (!parsed.ok) return errorResponse(parsed.error);
    cvChatModule.bindRequest(supabase);
    const conversation = presentConversation(await cvChatModule.renameConversation.execute({
      userId: user.id, cvId: id, conversationId, title: parsed.value.title, requestId: createRequestId("cv_chat"),
    }));
    return ok({ conversation: { id: conversation.id, title: conversation.title, createdAt: conversation.created_at, updatedAt: conversation.updated_at }} satisfies CVChatConversationMutationResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;
    const { id, conversationId } = await params;
    cvChatModule.bindRequest(supabase);
    await cvChatModule.deleteConversation.execute({ userId: user.id, cvId: id, conversationId, requestId: createRequestId("cv_chat") });
    return ok({ ok: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
