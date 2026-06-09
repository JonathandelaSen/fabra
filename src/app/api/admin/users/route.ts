import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { adminModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { ok, forbidden, handleApiError } from "@/modules/shared";
import { parseListAdminUsersRequest } from "./validation";
import type { ListAdminUsersResponse } from "./responses";

export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;

    if (!(await isAdminUser(user.id))) {
      throw forbidden("Forbidden");
    }

    const parsed = parseListAdminUsersRequest(req.nextUrl.searchParams);
    const result = await adminModule.listUsers.execute(parsed.value);

    return ok({
      users: result.users.map((entity) => entity.toPrimitives()),
      page: result.page,
      perPage: result.perPage,
      total: result.total,
    } satisfies ListAdminUsersResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
