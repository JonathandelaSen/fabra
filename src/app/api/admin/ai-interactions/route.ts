import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { aiInteractionsModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { forbidden, ok } from "@/modules/shared";
import type { ListAdminAIInteractionsResponse } from "./responses";

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;
    if (!(await isAdminUser(user.id))) throw forbidden("Forbidden");
    const interactions =
      await aiInteractionsModule.listAIInteractions.execute(user.id);
    return ok(interactions satisfies ListAdminAIInteractionsResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
