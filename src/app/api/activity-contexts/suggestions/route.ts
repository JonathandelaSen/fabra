import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { activityContextsModule } from "@/lib/container";
import {
  presentActivityContextSuggestion,
} from "@/modules/activity-context";
import { ok } from "@/modules/shared";
import {
  toActivityContextSuggestionResponse,
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
