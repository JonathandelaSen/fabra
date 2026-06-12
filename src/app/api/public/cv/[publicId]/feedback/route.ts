import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, errorResponse } from "@/modules/shared";

export async function POST(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (body.website) return ok({ submitted: true });
  const feedbackText = typeof body.feedbackText === "string" ? body.feedbackText.trim() : "";
  if (feedbackText.length < 2 || feedbackText.length > 5000) return errorResponse({ message: "Invalid feedback", status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${ip}`).digest("hex");
  const { publicId } = await params;
  const { error } = await createAdminClient().rpc("submit_public_cv_feedback", {
    p_public_id: publicId, p_ip_hash: ipHash, p_feedback_text: feedbackText,
    p_giver_name: typeof body.giverName === "string" ? body.giverName : null,
    p_giver_context: typeof body.giverContext === "string" ? body.giverContext : null,
  });
  if (error?.message.includes("RATE_LIMITED")) return errorResponse({ message: "Too many submissions", status: 429 });
  if (error) return errorResponse({ message: "Feedback is not available", status: 400 });
  return ok({ submitted: true });
}
