import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { ErrorCode } from "@/shared/error-codes";
import { createRequestId } from "@/lib/observability";
import { cvChatModule } from "@/lib/container";
import { presentConversation } from "@/modules/cv-chat";
import { created, notFound } from "@/modules/shared";
import type { CVChatConversationMutationResponse } from "../responses";
import { parseCreateCVChatConversationRequest } from "./validation";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;
    const { id } = await params;
    const parsed = parseCreateCVChatConversationRequest(await req.json());

    cvChatModule.bindRequest(supabase);
    const context = await cvChatModule.getCVChatContext.execute({ cvId: id, userId: user.id });
    if (!context) throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);
    const conversation = presentConversation(await cvChatModule.createConversation.execute({
      userId: user.id, cvId: id, title: parsed.value.title, requestId: createRequestId("cv_chat"),
    }));
    return created({ conversation: {
      id: conversation.id, title: conversation.title,
      createdAt: conversation.created_at, updatedAt: conversation.updated_at,
    }} satisfies CVChatConversationMutationResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
