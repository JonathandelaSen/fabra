import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { jobAnalysisChatModule } from "@/lib/container";
import { createRequestId } from "@/lib/observability";
import { badRequest, errorResponse, notFound, ok } from "@/backend/modules/shared";
import { presentMessage } from "@/backend/modules/job-analysis-chat";
import { parseApplyOfferChatCopyPasteRequest } from "./validation";
import type { ApplyOfferChatCopyPasteResponse } from "./responses";

async function validateJobMatch(analysisId: string, userId: string) {
  const context = await jobAnalysisChatModule.getJobAnalysisChatContext.execute({
    analysisId,
    userId,
  });
  if (!context) return { error: "Analysis not found", status: 404 as const };
  if (context.analysisMode !== "job_match") {
    return {
      error: "Only job match analyses can use offer chat",
      status: 400 as const,
    };
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = createRequestId("offer_chat_copy_paste_apply");
  const startedAt = performance.now();

  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseApplyOfferChatCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    jobAnalysisChatModule.bindRequest(supabase);
    const validationError = await validateJobMatch(id, user.id);
    if (validationError) {
      if (validationError.status === 404) throw notFound(validationError.error);
      throw badRequest(validationError.error);
    }

    const result = await jobAnalysisChatModule.applyOfferChatCopyPaste.execute({
      userId: user.id,
      analysisId: id,
      conversationId: parsed.value.conversationId,
      userMessage: parsed.value.userMessage,
      assistantResponse: parsed.value.assistantResponse,
      requestId,
      startedAt,
    });

    return ok({
      userMessage: presentMessage(result.userMessage),
      assistantMessage: presentMessage(result.assistantMessage),
    } satisfies ApplyOfferChatCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
