import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { activityContextsModule } from "@/lib/container";
import { presentActivityContext } from "@/modules/activity-context";
import { created, errorResponse } from "@/modules/shared";
import { parsePromoteActivityContextSuggestionRequest } from "./validation";
import { toActivityContextResponse, type CreateActivityContextResponse } from "./responses";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parsePromoteActivityContextSuggestionRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    activityContextsModule.bindRequest(supabase);
    const result = await activityContextsModule.promoteActivityContextSuggestion.execute({
      userId: user.id,
      ...parsed.value,
    });

    return created(
      toActivityContextResponse(
        presentActivityContext(result)
      ) satisfies CreateActivityContextResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
