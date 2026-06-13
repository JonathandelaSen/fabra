import "server-only";

import { BoundSupabaseRepository } from "@/modules/shared";
import { AIInteractionEvent, type AIInteractionEventPrimitives } from "../domain/entities/ai-interaction-event.entity";
import type { AIInteractionEventRepository } from "../domain/repositories/ai-interaction-event.repository";

export class SupabaseAIInteractionEventRepository
  extends BoundSupabaseRepository
  implements AIInteractionEventRepository
{
  async save(event: AIInteractionEvent): Promise<AIInteractionEvent> {
    const p = event.toPrimitives();
    const { data, error } = await this.client.from("ai_interaction_events").insert({
      id: p.id,
      interaction_id: p.interactionId,
      attempt_id: p.attemptId,
      event_name: p.eventName,
      user_id: p.userId,
      module: p.module,
      operation: p.operation,
      entity_type: p.entityType,
      entity_id: p.entityId,
      assistance_mode: p.assistanceMode,
      provider: p.provider,
      model: p.model,
      payload: p.payload,
      occurred_at: p.occurredAt,
      created_at: p.createdAt,
    }).select("*").single();
    if (error) throw error;
    const row = data as Record<string, unknown>;
    return AIInteractionEvent.fromPrimitives({
      id: row.id as string,
      interactionId: row.interaction_id as string,
      attemptId: row.attempt_id as string,
      eventName: row.event_name as string,
      userId: row.user_id as string,
      module: row.module as string,
      operation: row.operation as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      assistanceMode: row.assistance_mode as string,
      provider: row.provider as string,
      model: row.model as string | null,
      payload: row.payload as Record<string, unknown>,
      occurredAt: row.occurred_at as string,
      createdAt: row.created_at as string,
    } satisfies AIInteractionEventPrimitives);
  }
}
