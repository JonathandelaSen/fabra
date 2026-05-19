import { createClient } from "@supabase/supabase-js";
import { getE2EEnv, uniqueLabel } from "./env";

export const e2eEnv = getE2EEnv();

export const adminClient = createClient(
  e2eEnv.supabaseUrl,
  e2eEnv.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface E2EUser {
  id: string;
  email: string;
  password: string;
}

export async function createConfirmedUser(prefix = "e2e"): Promise<E2EUser> {
  const password = "local-e2e-password";
  const email = `${uniqueLabel(prefix)}@example.com`;
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return the created user.");

  return {
    id: data.user.id,
    email,
    password,
  };
}

export async function grantAdminAccess(userId: string) {
  const { error } = await adminClient
    .from("admin_users")
    .upsert({ user_id: userId });

  if (error) throw error;
}

export async function createProcessingEvent(input: {
  userId?: string | null;
  requestId?: string;
  stage?: string;
  status?: "started" | "success" | "warning" | "error";
  source?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}) {
  const { data, error } = await adminClient
    .from("processing_events")
    .insert({
      user_id: input.userId ?? null,
      request_id: input.requestId ?? "e2e-admin-observability",
      stage: input.stage ?? "ai_analysis",
      status: input.status ?? "success",
      source: input.source ?? "e2e",
      error_code: input.errorCode ?? null,
      error_message: input.errorMessage ?? null,
      duration_ms: 128,
      text_length: 42,
      file_size: 2048,
      metadata: { fixture: "admin-observability" },
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function getProcessingEvents(filter: {
  userId?: string;
  cvId?: string;
  analysisId?: string;
}) {
  let query = adminClient
    .from("processing_events")
    .select("id,user_id,cv_id,analysis_id,stage,status,source,error_code")
    .order("created_at", { ascending: true });

  if (filter.userId) query = query.eq("user_id", filter.userId);
  if (filter.cvId) query = query.eq("cv_id", filter.cvId);
  if (filter.analysisId) query = query.eq("analysis_id", filter.analysisId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
