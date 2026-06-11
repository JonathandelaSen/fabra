import "server-only";

import { getErrorMessage } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ERROR_LENGTH = 700;

export function createRequestId(prefix = "req") {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function sanitizeErrorMessage(message: unknown) {
  return truncateForEvent(getErrorMessage(message))
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[redacted-api-key]")
    .replace(/Bearer\s+[0-9A-Za-z._-]+/gi, "Bearer [redacted]")
    .replace(/\s+/g, " ")
    .trim();
}

export function getErrorCode(error: unknown) {
  if (error instanceof Error) return error.name || "Error";
  return "UnknownError";
}

export function getTextLength(text: string | null | undefined) {
  return text?.trim().length ?? 0;
}

export function hasExtractedText(texts: Array<string | null | undefined>) {
  return texts.some((text) => getTextLength(text) > 0);
}

export async function isAdminUser(userId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        JSON.stringify({
          event: "admin_lookup_failed",
          user_id: userId,
          error: sanitizeErrorMessage(error.message),
        })
      );
      return false;
    }

    return Boolean(data);
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        event: "admin_lookup_failed",
        user_id: userId,
        error: sanitizeErrorMessage(error),
      })
    );
    return false;
  }
}

function truncateForEvent(message: string) {
  return message.slice(0, MAX_ERROR_LENGTH);
}
