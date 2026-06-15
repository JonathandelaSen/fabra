import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { getBestCVText } from "@/lib/cv-profile";
import { selectionProcessModule } from "@/lib/container";
import { presentProcessQuestion } from "@/modules/selection-process";
import { createRequestId } from "@/lib/observability";
import { errorResponse, notFound } from "@/modules/shared";
import { ok } from "@/modules/shared";
import { validateQuestionLinks } from "../../../validation";
import { parsePrepareInterviewQuestionCopyPasteRequest } from "./validation";
import type { PrepareInterviewQuestionCopyPasteResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePrepareInterviewQuestionCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    selectionProcessModule.bindRequest(supabase);

    const readModel = await selectionProcessModule.getProcessQuestion.execute({
      id,
      userId: user.id,
    });
    const existing = readModel ? presentProcessQuestion(readModel) : null;
    if (!existing) throw notFound("Question not found", ErrorCode.QUESTION_NOT_FOUND);

    const links = await validateQuestionLinks(supabase, user.id, {
      cv_id: existing.cv_id,
      analysis_id: existing.analysis_id,
    });
    if (!links.ok) return links.response;

    const cvText = links.cv ? getBestCVText(links.cv) : null;

    const result =
      await selectionProcessModule.prepareQuestionAnswerCopyPaste.execute({
        id,
        userId: user.id,
        mode: parsed.value.mode,
        instruction: parsed.value.instruction,
        cv: links.cv,
        cvText,
        analysis: links.analysis,
        requestId: createRequestId("interview_question_copy_paste_prepare"),
      });

    if (!result) throw notFound("Question not found", ErrorCode.QUESTION_NOT_FOUND);

    return ok(result satisfies PrepareInterviewQuestionCopyPasteResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
