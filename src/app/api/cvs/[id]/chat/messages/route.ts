import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { createRequestId } from "@/lib/observability";
import { cvChatModule } from "@/lib/container";
import { presentMessage, presentMessages } from "@/modules/cv-chat";
import { errorResponse, ok } from "@/modules/shared";
import type { CVChatMessageResponse, ListCVChatMessagesResponse, SendCVChatMessageResponse } from "../responses";
import { parseListCVChatMessagesRequest, parseSendCVChatMessageRequest } from "./validation";

export const maxDuration = 60;

function present(message: ReturnType<typeof presentMessage>): CVChatMessageResponse {
  return { id: message.id, conversationId: message.conversation_id, role: message.role, content: message.content, model: message.model, metadata: message.metadata, createdAt: message.created_at };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;
    const { id } = await params;
    const parsed = parseListCVChatMessagesRequest(new URL(req.url).searchParams);
    if (!parsed.ok) return errorResponse(parsed.error);
    cvChatModule.bindRequest(supabase);
    const messages = await cvChatModule.listMessages.execute({ userId: user.id, cvId: id, conversationId: parsed.value.conversationId });
    return ok({ messages: presentMessages(messages).map(present) } satisfies ListCVChatMessagesResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId("cv_chat");
  const startedAt = performance.now();
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;
    const { id } = await params;
    const parsed = parseSendCVChatMessageRequest(await req.json());
    if (!parsed.ok) return errorResponse(parsed.error);
    cvChatModule.bindRequest(supabase);
    const result = await cvChatModule.sendMessage.execute({ userId: user.id, cvId: id, ...parsed.value, requestId, startedAt });
    return ok({ userMessage: present(presentMessage(result.userMessage)), assistantMessage: present(presentMessage(result.assistantMessage)) } satisfies SendCVChatMessageResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
