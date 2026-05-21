import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { analysisChatModule } from "@/lib/container";
import { createRequestId } from "@/lib/observability";
import {
  badRequest,
  errorResponse,
  handleApiError,
  notFound,
  ok,
} from "@/modules/shared";
import { parsePrepareOfferChatCopyPasteRequest } from "./validation";
import type { PrepareOfferChatCopyPasteResponse } from "./responses";

async function validateJobMatch(analysisId: string, userId: string) {
  const context = await analysisChatModule.getAnalysisChatContext.execute({
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
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePrepareOfferChatCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    analysisChatModule.bindRequest(supabase);
    const validationError = await validateJobMatch(id, user.id);
    if (validationError) {
      if (validationError.status === 404) throw notFound(validationError.error);
      throw badRequest(validationError.error);
    }

    const result = await analysisChatModule.prepareOfferChatCopyPaste.execute({
      userId: user.id,
      analysisId: id,
      conversationId: parsed.value.conversationId,
      message: parsed.value.message,
      requestId: createRequestId("offer_chat_copy_paste_prepare"),
    });

    return ok(result satisfies PrepareOfferChatCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
