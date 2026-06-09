"use client";

import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  clearImpersonationMarker,
  setImpersonationMarker,
} from "@/frontend/impersonation-storage";
import { impersonateUser } from "../api/admin-users-api";

export function useImpersonateUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const session = await impersonateUser(userId);

      setImpersonationMarker(session.targetEmail);
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: session.tokenHash,
      });

      if (error) {
        clearImpersonationMarker();
        throw new Error(error.message);
      }

      window.location.assign("/");
    },
  });
}
