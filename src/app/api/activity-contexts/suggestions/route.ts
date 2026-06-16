import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { activityContextsModule } from "@/lib/container";
import {
  presentActivityContext,
  presentActivityContextSuggestion,
} from "@/modules/activity-context";
import { created, errorResponse, ok } from "@/modules/shared";
import { parseActivityContextSuggestionRequest } from "./validation";
import {
  toActivityContextResponse,
  toActivityContextSuggestionResponse,
  type CreateActivityContextResponse,
  type DismissActivityContextSuggestionResponse,
  type ListActivityContextSuggestionsResponse,
} from "./responses";

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    activityContextsModule.bindRequest(supabase);
    const suggestions =
      await activityContextsModule.listActivityContextSuggestions.execute(user.id);
    return ok({
      suggestions: suggestions.map((suggestion) =>
        toActivityContextSuggestionResponse(
          presentActivityContextSuggestion(suggestion),
        )
      ),
    } satisfies ListActivityContextSuggestionsResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseActivityContextSuggestionRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    activityContextsModule.bindRequest(supabase);
    const result = await activityContextsModule.handleActivityContextSuggestion.execute({
      userId: user.id,
      ...parsed.value,
    });
    if ("ok" in result) {
      return ok(result satisfies DismissActivityContextSuggestionResponse);
    }
    return created(
      toActivityContextResponse(
        presentActivityContext(result)
      ) satisfies CreateActivityContextResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
