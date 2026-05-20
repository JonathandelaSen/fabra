import { createClient } from "@/lib/supabase/client";

export async function sendPasswordRecoveryEmail(email: string) {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=/account/update-password`;

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
}
