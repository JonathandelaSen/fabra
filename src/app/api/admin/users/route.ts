import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { adminModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { ok, forbidden, badRequest, errorResponse } from "@/backend/modules/shared";
import { parseListAdminUsersRequest, parseDeleteUserRequest } from "./validation";
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

export async function DELETE(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;

    if (!(await isAdminUser(user.id))) {
      throw forbidden("Forbidden");
    }

    const parsed = parseDeleteUserRequest(req.nextUrl.searchParams);
    if (!parsed.ok) return errorResponse(parsed.error);

    if (parsed.value.userId === user.id) {
      throw badRequest("You cannot delete your own account.");
    }

    await adminModule.deleteUser.execute(parsed.value);

    return ok({ success: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

