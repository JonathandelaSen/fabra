import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError, ok } from "@/modules/shared";
import { toAIDefaultSettingsResponse } from "./responses";

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;

    return ok(toAIDefaultSettingsResponse());
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
