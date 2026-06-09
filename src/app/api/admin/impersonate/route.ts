import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { adminModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { ok, errorResponse, forbidden, handleApiError } from "@/modules/shared";
import { parseImpersonateUserRequest } from "./validation";
import type { ImpersonateUserResponse } from "./responses";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;

    if (!(await isAdminUser(user.id))) {
      throw forbidden("Forbidden");
    }

    const body = await req.json();
    const parsed = parseImpersonateUserRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const session = await adminModule.startUserImpersonation.execute({
      actorUserId: user.id,
      actorEmail: user.email ?? null,
      targetUserId: parsed.value.userId,
    });

    return ok(session.toPrimitives() satisfies ImpersonateUserResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
