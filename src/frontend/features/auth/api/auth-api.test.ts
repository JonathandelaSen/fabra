import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithOAuth = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth,
    },
  }),
}));

import * as authApi from "./auth-api";

describe("signInWithGoogle", () => {
  beforeEach(() => {
    signInWithOAuth.mockReset();
    signInWithOAuth.mockResolvedValue({ data: {}, error: null });
  });

  it("starts Google OAuth through the shared auth callback", async () => {
    await (
      authApi as typeof authApi & {
        signInWithGoogle: () => Promise<unknown>;
      }
    ).signInWithGoogle();

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost/auth/callback",
      },
    });
  });
});
