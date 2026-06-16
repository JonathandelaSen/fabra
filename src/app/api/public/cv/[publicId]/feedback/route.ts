import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, errorResponse } from "@/modules/shared";
import { parseSubmitPublicCVFeedbackRequest } from "./validation";
import type { SubmitPublicCVFeedbackResponse } from "./responses";

export async function POST(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const body = await req.json().catch(() => ({}));
  const parsed = parseSubmitPublicCVFeedbackRequest(body);
  if (!parsed.ok) return errorResponse(parsed.error);
  if (parsed.value.website) {
    return ok({ submitted: true } satisfies SubmitPublicCVFeedbackResponse);
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${ip}`).digest("hex");
  const { publicId } = await params;
  const { error } = await createAdminClient().rpc("submit_public_cv_feedback", {
    p_public_id: publicId, p_ip_hash: ipHash, p_feedback_text: parsed.value.feedbackText,
    p_giver_name: parsed.value.giverName,
    p_giver_context: parsed.value.giverContext,
  });
  if (error?.message.includes("RATE_LIMITED")) return errorResponse({ message: "Too many submissions", status: 429 });
  if (error) return errorResponse({ message: "Feedback is not available", status: 400 });
  return ok({ submitted: true } satisfies SubmitPublicCVFeedbackResponse);
}
