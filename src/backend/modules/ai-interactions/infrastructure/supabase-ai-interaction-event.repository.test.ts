import { describe, expect, it } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
} from "@/backend/modules/test-helpers/setup";
import { AIInteractionEvent } from "../domain/entities/ai-interaction-event.entity";
import { SupabaseAIInteractionEventRepository } from "./supabase-ai-interaction-event.repository";

const repository = new SupabaseAIInteractionEventRepository();
repository.bindRequest(getSupabaseClient());

describe("SupabaseAIInteractionEventRepository", () => {
  it("saves an AI interaction event aggregate", async () => {
    const user = await createTestUser("ai-interaction-event");
    const id = crypto.randomUUID();

    const saved = await repository.save(
      AIInteractionEvent.create({
        id,
        interactionId: crypto.randomUUID(),
        attemptId: crypto.randomUUID(),
        eventName: "ai_runtime.prompt_prepared",
        userId: user.id,
        module: "cv_analysis",
        operation: "score_cv",
        entityType: "cv_analysis",
        entityId: crypto.randomUUID(),
        assistanceMode: "integrated",
        provider: "mock",
        model: "mock-model",
        payload: { prompt: "hello" },
        occurredAt: "2026-06-13T10:00:00.000Z",
        createdAt: "2026-06-13T10:00:00.000Z",
      }),
    );

    expect(saved.toPrimitives()).toMatchObject({
      id,
      eventName: "ai_runtime.prompt_prepared",
      payload: { prompt: "hello" },
    });
  });
});
