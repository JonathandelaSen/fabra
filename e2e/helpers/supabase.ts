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

