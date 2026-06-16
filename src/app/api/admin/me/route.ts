import { NextResponse } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { isAdminUser } from "@/lib/observability";
import { ok } from "@/modules/shared";
import type { GetAdminMeResponse } from "./responses";

export async function GET() {
  const authContext = await getAuthenticatedRequestContext();
  if (!authContext.ok) {
    return NextResponse.json(
      { isAdmin: false } satisfies GetAdminMeResponse,
      { status: 401 },
    );
  }
  const { user } = authContext;

  return ok({ isAdmin: await isAdminUser(user.id) } satisfies GetAdminMeResponse);
}
