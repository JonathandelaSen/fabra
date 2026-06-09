import { describe, expect, it } from "vitest";
import { createMockTracker, createTestUser } from "@/modules/test-helpers/setup";
import { ImpersonationTargetNotFoundError } from "../../domain/errors/impersonation-target-not-found.error";
import { SelfImpersonationError } from "../../domain/errors/self-impersonation.error";
import { SupabaseImpersonationSessionService } from "../../infrastructure/services/supabase-impersonation-session.service";
import { StartUserImpersonationUseCase } from "./start-user-impersonation.use-case";

function createUseCase() {
  const tracker = createMockTracker();
  const useCase = new StartUserImpersonationUseCase({
    impersonationSessionService: new SupabaseImpersonationSessionService(),
    tracker,
  });
  return { useCase, tracker };
}

describe("StartUserImpersonationUseCase", () => {
  it("creates an impersonation session and records the event", async () => {
    const admin = await createTestUser("imp-uc-admin");
    const target = await createTestUser("imp-uc-target");
    const { useCase, tracker } = createUseCase();

    const session = await useCase.execute({
      actorUserId: admin.id,
      actorEmail: admin.email,
      targetUserId: target.id,
    });

    const primitives = session.toPrimitives();
    expect(primitives.tokenHash.length).toBeGreaterThan(0);
    expect(primitives.targetUserId).toBe(target.id);
    expect(primitives.targetEmail).toBe(target.email);

    expect(tracker.record).toHaveBeenCalledTimes(1);
    expect(tracker.record.mock.calls[0][0]).toMatchObject({
      userId: admin.id,
      stage: "admin_impersonation_started",
      status: "success",
      source: "admin",
      metadata: {
        admin_user_id: admin.id,
        admin_email: admin.email,
        target_user_id: target.id,
        target_email: target.email,
      },
    });
  });

  it("rejects self-impersonation without creating a session", async () => {
    const admin = await createTestUser("imp-uc-self");
    const { useCase, tracker } = createUseCase();

    await expect(
      useCase.execute({
        actorUserId: admin.id,
        actorEmail: admin.email,
        targetUserId: admin.id,
      })
    ).rejects.toBeInstanceOf(SelfImpersonationError);
    expect(tracker.record).not.toHaveBeenCalled();
  });

  it("throws a not-found error for unknown targets", async () => {
    const admin = await createTestUser("imp-uc-missing");
    const { useCase, tracker } = createUseCase();

    await expect(
      useCase.execute({
        actorUserId: admin.id,
        actorEmail: admin.email,
        targetUserId: "00000000-0000-0000-0000-000000000001",
      })
    ).rejects.toBeInstanceOf(ImpersonationTargetNotFoundError);
    expect(tracker.record).not.toHaveBeenCalled();
  });
});
