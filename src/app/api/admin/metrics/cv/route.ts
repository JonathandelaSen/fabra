import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { adminModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { ok, forbidden, errorResponse } from "@/modules/shared";
import { parseMetricsWindowRequest } from "../_shared/validation";
import type { CVMetricsResponse } from "./responses";

export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;

    if (!(await isAdminUser(user.id))) {
      throw forbidden("Forbidden");
    }

    const parsed = parseMetricsWindowRequest(req.nextUrl.searchParams);
    if (!parsed.ok) return errorResponse(parsed.error);

    const result = await adminModule.getCVContentMetrics.execute(parsed.value);

    return ok({
      counts: result.counts.toPrimitives(),
      windowDays: result.windowDays,
    } satisfies CVMetricsResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
