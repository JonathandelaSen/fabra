import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import { SupabaseImpersonationSessionService } from "./supabase-impersonation-session.service";

const service = new SupabaseImpersonationSessionService();

describe("SupabaseImpersonationSessionService", () => {
  it("creates a magic link impersonation session for a valid user", async () => {
    const user = await createTestUser("imp-srv-valid");

    const session = await service.createForUser(user.id);

    expect(session).not.toBeNull();
    const primitives = session!.toPrimitives();
    expect(primitives.tokenHash.length).toBeGreaterThan(0);
    expect(primitives.targetUserId).toBe(user.id);
    expect(primitives.targetEmail).toBe(user.email);
  });

  it("returns null when the target user does not exist", async () => {
    const nonExistentUserId = "00000000-0000-0000-0000-000000000001";
    const session = await service.createForUser(nonExistentUserId);
    expect(session).toBeNull();
  });
});
