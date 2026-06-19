import { CHAT_ACTIONS } from "@/app/api/_shared/job-analysis-chat/actions";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { jobAnalysisChatModule } from "@/lib/container";
import { createRequestId } from "@/lib/observability";
import {
  parseListOfferChatRequest,
  parseOfferChatPostRequest,
} from "./validation";
import {
  toDeleteOfferChatConversationResponse,
  toListOfferChatConversationsResponse,
  toListOfferChatMessagesResponse,
  toOfferChatConversationMutationResponse,
  toSendOfferChatMessageResponse,
} from "./responses";
import { ok, errorResponse, notFound, badRequest } from "@/backend/modules/shared";

export const maxDuration = 60;

async function validateJobMatch(analysisId: string, userId: string) {
  const context = await jobAnalysisChatModule.getJobAnalysisChatContext.execute(
    {
      analysisId,
      userId,
    },
  );
  if (!context) return { error: "Analysis not found", status: 404 as const };
  if (context.analysisMode !== "job_match") {
    return {
      error: "Only job match analyses can use offer chat",
      status: 400 as const,
    };
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    jobAnalysisChatModule.bindRequest(supabase);
    const validationError = await validateJobMatch(id, user.id);
    if (validationError) {
      if (validationError.status === 404) throw notFound(validationError.error);
      throw badRequest(validationError.error);
    }

    const parsed = parseListOfferChatRequest(req.nextUrl.searchParams);
    const { conversationId } = parsed.value;

    if (conversationId) {
      const messages = await jobAnalysisChatModule.listMessages.execute({
        userId: user.id,
        conversationId,
      });
      return ok(toListOfferChatMessagesResponse(messages));
    }

    const conversations = await jobAnalysisChatModule.listConversations.execute(
      {
        userId: user.id,
        analysisId: id,
      },
    );
    return ok(toListOfferChatConversationsResponse(conversations));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = createRequestId("offer_chat");
  const startedAt = performance.now();

  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const body = await req.json();
    const parsed = parseOfferChatPostRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }

    jobAnalysisChatModule.bindRequest(supabase);
    const validationError = await validateJobMatch(id, user.id);
    if (validationError) {
      if (validationError.status === 404) throw notFound(validationError.error);
      throw badRequest(validationError.error);
    }

    if (parsed.value.action === CHAT_ACTIONS.createConversation) {
      const conversation =
        await jobAnalysisChatModule.createConversation.execute({
          userId: user.id,
          analysisId: id,
          title: parsed.value.title,
          requestId,
        });
      return ok(toOfferChatConversationMutationResponse(conversation));
    }

    if (parsed.value.action === CHAT_ACTIONS.renameConversation) {
      const conversation =
        await jobAnalysisChatModule.renameConversation.execute({
          userId: user.id,
          analysisId: id,
          conversationId: parsed.value.conversationId,
          title: parsed.value.title,
          requestId,
        });
      return ok(toOfferChatConversationMutationResponse(conversation));
    }

    if (parsed.value.action === CHAT_ACTIONS.deleteConversation) {
      await jobAnalysisChatModule.deleteConversation.execute({
        userId: user.id,
        analysisId: id,
        conversationId: parsed.value.conversationId,
        requestId,
      });
      return ok(toDeleteOfferChatConversationResponse());
    }

    const result = await jobAnalysisChatModule.sendMessage.execute({
      userId: user.id,
      analysisId: id,
      conversationId: parsed.value.conversationId,
      message: parsed.value.message,
      provider: parsed.value.provider,
      apiKey: parsed.value.apiKey,
      baseUrl: parsed.value.baseUrl,
      model: parsed.value.model,
      requestId,
      startedAt,
    });

    return ok(toSendOfferChatMessageResponse(result));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
