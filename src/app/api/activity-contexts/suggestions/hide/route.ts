import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { activityContextsModule } from "@/lib/container";
import { ok, errorResponse } from "@/modules/shared";
import { parseHideActivityContextSuggestionRequest } from "./validation";
import { type DismissActivityContextSuggestionResponse } from "./responses";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseHideActivityContextSuggestionRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    activityContextsModule.bindRequest(supabase);
    const result = await activityContextsModule.hideActivityContextSuggestion.execute({
      userId: user.id,
      ...parsed.value,
    });

    return ok({ ok: result.toPrimitives() as true } satisfies DismissActivityContextSuggestionResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
