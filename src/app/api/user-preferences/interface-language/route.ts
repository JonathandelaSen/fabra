import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { errorResponse, ok } from "@/modules/shared";
import { toInterfaceLanguagePreferenceResponse } from "./responses";
import { parseUpdateInterfaceLanguagePreferenceRequest } from "./validation";

export async function PUT(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseUpdateInterfaceLanguagePreferenceRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        interface_language: parsed.value.locale,
      },
      { onConflict: "user_id" },
    );

    if (error) throw error;

    return ok(toInterfaceLanguagePreferenceResponse(parsed.value.locale));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
