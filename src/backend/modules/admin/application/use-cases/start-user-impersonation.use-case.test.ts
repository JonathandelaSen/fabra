import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import { ImpersonationTargetNotFoundError } from "../../domain/errors/impersonation-target-not-found.error";
import { SelfImpersonationError } from "../../domain/errors/self-impersonation.error";
import { SupabaseImpersonationSessionService } from "../../infrastructure/services/supabase-impersonation-session.service";
import { StartUserImpersonationUseCase } from "./start-user-impersonation.use-case";

function createUseCase() {
  const useCase = new StartUserImpersonationUseCase({
    impersonationSessionService: new SupabaseImpersonationSessionService(),
  });
  return { useCase };
}

describe("StartUserImpersonationUseCase", () => {
  it("creates an impersonation session", async () => {
    const admin = await createTestUser("imp-uc-admin");
    const target = await createTestUser("imp-uc-target");
    const { useCase } = createUseCase();

    const session = await useCase.execute({
      actorUserId: admin.id,
      actorEmail: admin.email,
      targetUserId: target.id,
    });

    const primitives = session.toPrimitives();
    expect(primitives.tokenHash.length).toBeGreaterThan(0);
    expect(primitives.targetUserId).toBe(target.id);
    expect(primitives.targetEmail).toBe(target.email);
  });

  it("rejects self-impersonation without creating a session", async () => {
    const admin = await createTestUser("imp-uc-self");
    const { useCase } = createUseCase();

    await expect(
      useCase.execute({
        actorUserId: admin.id,
        actorEmail: admin.email,
        targetUserId: admin.id,
      })
    ).rejects.toBeInstanceOf(SelfImpersonationError);
  });

  it("throws a not-found error for unknown targets", async () => {
    const admin = await createTestUser("imp-uc-missing");
    const { useCase } = createUseCase();

    await expect(
      useCase.execute({
        actorUserId: admin.id,
        actorEmail: admin.email,
        targetUserId: "00000000-0000-0000-0000-000000000001",
      })
    ).rejects.toBeInstanceOf(ImpersonationTargetNotFoundError);
  });
});
