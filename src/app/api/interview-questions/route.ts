import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import {
  parseCreateInterviewQuestionRequest,
  parseListInterviewQuestionsRequest,
  validateQuestionLinks,
} from "./validation";
import { selectionProcessModule } from "@/lib/container";
import { presentProcessQuestion, presentProcessQuestions } from "@/modules/selection-process";
import { ok, created, errorResponse } from "@/modules/shared";
import {
  toInterviewQuestionResponse,
  toInterviewQuestionResponses,
  type ListInterviewQuestionsResponse,
  type SaveInterviewQuestionResponse,
} from "./responses";

export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const parsed = parseListInterviewQuestionsRequest(req.nextUrl.searchParams);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const questions = await selectionProcessModule
      .bindRequest(supabase)
      .listProcessQuestions.execute({
      userId: user.id,
      ...parsed.value,
    });

    return ok(
      toInterviewQuestionResponses(
        presentProcessQuestions(questions)
      ) satisfies ListInterviewQuestionsResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const data = await req.json();
    const parsed = parseCreateInterviewQuestionRequest(data);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const { question, context, answer, cv_id, analysis_id } = parsed.value;

    const links = await validateQuestionLinks(supabase, user.id, {
      cv_id,
      analysis_id,
    });
    if (!links.ok) {
      return links.response;
    }
    const linkedCvId = cv_id ?? links.analysis?.cv_id ?? null;

    const createdQuestion = await selectionProcessModule
      .bindRequest(supabase)
      .createProcessQuestion.execute({
      userId: user.id,
      question,
      context,
      answer,
      legacyCvId: linkedCvId,
      sourceJobMatchAnalysisId: analysis_id,
    });
    const response = presentProcessQuestion(createdQuestion);

    return created(
      toInterviewQuestionResponse(response) satisfies SaveInterviewQuestionResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
