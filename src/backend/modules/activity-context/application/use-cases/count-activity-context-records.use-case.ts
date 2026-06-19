import { Counter, EntityId, UserId } from "@/backend/modules/shared";
import type { ActivityContextRepository } from "../../domain/repositories/activity-context.repository";

export class CountActivityContextRecordsUseCase {
  constructor(private readonly deps: { activityContextRepo: ActivityContextRepository }) {}

  async execute(input: { id: string; userId: string }): Promise<Counter> {
    const count = await this.deps.activityContextRepo.countAssignedRecords(
      EntityId.fromPrimitives(input.id),
      UserId.fromPrimitives(input.userId),
    );
    return Counter.fromPrimitives(count);
  }
}
