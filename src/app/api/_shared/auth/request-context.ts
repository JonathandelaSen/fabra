import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { telemetry } from "@/lib/telemetry";
import { ErrorCode, type ErrorResponseBody } from "@/shared/error-codes";

type RequestSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type AuthenticatedRequestContext =
  | {
      ok: true;
      supabase: RequestSupabaseClient;
      user: User;
    }
  | {
      ok: false;
      supabase: RequestSupabaseClient;
      user: null;
      response: NextResponse<ErrorResponseBody>;
    };

export async function getAuthenticatedRequestContext(): Promise<AuthenticatedRequestContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    telemetry.setUser(null);
    return {
      ok: false,
      supabase,
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized", code: ErrorCode.UNAUTHORIZED },
        { status: 401 },
      ),
    };
  }

  telemetry.setUser({ id: user.id });
  return { ok: true, supabase, user };
}
