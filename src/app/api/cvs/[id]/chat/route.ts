import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { ErrorCode } from "@/shared/error-codes";
import { cvChatModule } from "@/lib/container";
import { presentConversations } from "@/modules/cv-chat";
import { notFound, ok } from "@/modules/shared";
import type { ListCVChatConversationsResponse } from "./responses";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;
    const { id } = await params;

    cvChatModule.bindRequest(supabase);
    const context = await cvChatModule.getCVChatContext.execute({ cvId: id, userId: user.id });
    if (!context) throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);

    const conversations = await cvChatModule.listConversations.execute({ userId: user.id, cvId: id });
    return ok({
      conversations: presentConversations(conversations).map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      })),
    } satisfies ListCVChatConversationsResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
