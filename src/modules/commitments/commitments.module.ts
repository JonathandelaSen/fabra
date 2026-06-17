import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/modules/shared";
import { CreateCommitmentUseCase } from "./application/use-cases/create-commitment.use-case";
import { CreateCommitmentItemUseCase } from "./application/use-cases/create-item.use-case";
import { CreateCommitmentOutcomeUseCase } from "./application/use-cases/create-outcome.use-case";
import { DeleteCommitmentUseCase } from "./application/use-cases/delete-commitment.use-case";
import { DeleteCommitmentItemUseCase } from "./application/use-cases/delete-item.use-case";
import { DeleteCommitmentOutcomeUseCase } from "./application/use-cases/delete-outcome.use-case";
import { ListCommitmentsWorkspaceUseCase } from "./application/use-cases/list-commitments-workspace.use-case";
import { ListCommitmentsInRangeUseCase } from "./application/use-cases/list-commitments-in-range.use-case";
import { UpdateCommitmentUseCase } from "./application/use-cases/update-commitment.use-case";
import { UpdateCommitmentItemUseCase } from "./application/use-cases/update-item.use-case";
import { UpdateCommitmentOutcomeUseCase } from "./application/use-cases/update-outcome.use-case";
import { SupabaseCommitmentItemRepository } from "./infrastructure/repositories/supabase-commitment-item.repository";
import { SupabaseCommitmentOutcomeRepository } from "./infrastructure/repositories/supabase-commitment-outcome.repository";
import { SupabaseCommitmentRepository } from "./infrastructure/repositories/supabase-commitment.repository";

const commitmentRepo = new SupabaseCommitmentRepository();
const itemRepo = new SupabaseCommitmentItemRepository();
const outcomeRepo = new SupabaseCommitmentOutcomeRepository();

function createUseCases(eventBus: EventBus) {
  return {
    listWorkspace: new ListCommitmentsWorkspaceUseCase({
      commitmentRepo,
      itemRepo,
      outcomeRepo,
    }),
    listCommitmentsInRange: new ListCommitmentsInRangeUseCase({
      commitmentRepo,
    }),
    createCommitment: new CreateCommitmentUseCase({ commitmentRepo, eventBus }),
    updateCommitment: new UpdateCommitmentUseCase({ commitmentRepo, eventBus }),
    deleteCommitment: new DeleteCommitmentUseCase({ commitmentRepo, eventBus }),
    createItem: new CreateCommitmentItemUseCase({ itemRepo, eventBus }),
    updateItem: new UpdateCommitmentItemUseCase({ itemRepo, eventBus }),
    deleteItem: new DeleteCommitmentItemUseCase({ itemRepo, eventBus }),
    createOutcome: new CreateCommitmentOutcomeUseCase({ outcomeRepo, eventBus }),
    updateOutcome: new UpdateCommitmentOutcomeUseCase({ outcomeRepo, eventBus }),
    deleteOutcome: new DeleteCommitmentOutcomeUseCase({ outcomeRepo, eventBus }),
  };
}

export type CommitmentsModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): CommitmentsModule;
};

export function createCommitmentsModule(telemetry: Telemetry, eventBus: EventBus): CommitmentsModule {
  const useCases = instrumentUseCases("commitments", createUseCases(eventBus), telemetry);

  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      commitmentRepo.bindRequest(client);
      itemRepo.bindRequest(client);
      outcomeRepo.bindRequest(client);
      return this;
    },
  };
}
