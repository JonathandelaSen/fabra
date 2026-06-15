import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { getBestCVText } from "@/lib/cv-profile";
import {
  parseEditInterviewQuestionRequest,
  validateQuestionLinks,
} from "../../validation";
import { selectionProcessModule } from "@/lib/container";
import { presentProcessQuestion } from "@/modules/selection-process";
import { ok, errorResponse, notFound, badRequest } from "@/modules/shared";
import {
  toInterviewQuestionResponse,
  type EditInterviewQuestionResponse,
} from "../../responses";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const existingReadModel = await selectionProcessModule
      .bindRequest(supabase)
      .getProcessQuestion.execute({ id, userId: user.id });
    const existing = existingReadModel
      ? presentProcessQuestion(existingReadModel)
      : null;
    if (!existing) {
      throw notFound("Question not found", ErrorCode.QUESTION_NOT_FOUND);
    }

    const body = await req.json();
    const parsed = parseEditInterviewQuestionRequest(body, existing.context);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const { provider, apiKey, baseUrl, model, context, instruction } = parsed.value;
    if (!existing.answer?.trim()) {
      throw badRequest("There is no answer to edit", ErrorCode.NO_ANSWER_TO_EDIT);
    }

    const links = await validateQuestionLinks(supabase, user.id, {
      cv_id: existing.cv_id,
      analysis_id: existing.analysis_id,
    });
    if (!links.ok) {
      return links.response;
    }
    if (links.analysis && links.analysis.analysis_mode !== "job_match") {
      throw badRequest("Only job match analyses can be linked as offers", ErrorCode.ONLY_JOB_MATCH_LINKABLE_AS_OFFER);
    }

    const cvText = links.cv ? getBestCVText(links.cv) : null;

    const updated = await selectionProcessModule
      .bindRequest(supabase)
      .editQuestionAnswer.execute({
      id,
      userId: user.id,
      provider,
      apiKey,
      baseUrl,
      model,
      context,
      instruction,
      cv: links.cv,
      cvText,
      analysis: links.analysis,
    });

    return ok(
      (updated
        ? toInterviewQuestionResponse(presentProcessQuestion(updated))
        : null) satisfies EditInterviewQuestionResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
