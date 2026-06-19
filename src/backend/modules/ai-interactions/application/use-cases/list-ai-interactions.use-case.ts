import { createHash } from "node:crypto";
import { UserId } from "@/backend/modules/shared";
import type { AIInteractionEventRepository } from "../../domain/repositories/ai-interaction-event.repository";
import type { AIInteractionReviewRepository } from "../../domain/repositories/ai-interaction-review.repository";
import { AIInteractionReadModel } from "../../domain/value-objects/ai-interaction-read-model.value-object";

export class ListAIInteractionsUseCase {
  constructor(private readonly deps: {
    eventRepository: AIInteractionEventRepository;
    reviewRepository: AIInteractionReviewRepository;
  }) {}

  async execute(userIdValue: string): Promise<AIInteractionReadModel[]> {
    const userId = UserId.fromPrimitives(userIdValue);
    const [events, reviews] = await Promise.all([
      this.deps.eventRepository.searchByUser(userId),
      this.deps.reviewRepository.searchByReviewer(userId),
    ]);
    const reviewMap = new Map(reviews.map((review) => {
      const p = review.toPrimitives();
      return [p.interactionId, { rating: p.rating, note: p.note }] as const;
    }));
    const groups = new Map<string, ReturnType<(typeof events)[number]["toPrimitives"]>[]>();
    for (const event of events) {
      const p = event.toPrimitives();
      groups.set(p.interactionId, [...(groups.get(p.interactionId) ?? []), p]);
    }
    return [...groups.entries()].map(([interactionId, group]) => {
      const ordered = group.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
      const first = ordered[0];
      const prepared = ordered.find((event) => event.eventName === "ai_runtime.prompt_prepared");
      const received = ordered.findLast((event) => event.eventName === "ai_runtime.response_received");
      const validated = ordered.findLast((event) => event.eventName === "ai_runtime.response_validated");
      const failed = ordered.findLast((event) => event.eventName === "ai_runtime.failed");
      const applied = ordered.findLast((event) => event.eventName === "ai_runtime.result_applied");
      const prompt = typeof prepared?.payload.prompt === "string" ? prepared.payload.prompt : null;
      return AIInteractionReadModel.fromPrimitives({
        interactionId,
        module: first.module,
        operation: first.operation,
        entityType: first.entityType,
        entityId: first.entityId,
        assistanceMode: first.assistanceMode,
        provider: first.provider,
        model: first.model,
        status: failed ? "failed" : applied ? "applied" : validated ? "validated" : "prepared",
        eventNames: ordered.map((event) => event.eventName),
        occurredAt: first.occurredAt,
        prompt,
        promptHash: prompt ? createHash("sha256").update(prompt).digest("hex") : null,
        promptVersion: typeof prepared?.payload.promptVersion === "string" ? prepared.payload.promptVersion : null,
        rawResponse: typeof received?.payload.rawResponse === "string" ? received.payload.rawResponse : null,
        parsedResult: validated?.payload.parsedResult ?? null,
        error: typeof failed?.payload.errorMessage === "string" ? failed.payload.errorMessage : null,
        durationMs: typeof received?.payload.durationMs === "number" ? received.payload.durationMs : null,
        review: reviewMap.get(interactionId) ?? null,
      });
    });
  }
}
