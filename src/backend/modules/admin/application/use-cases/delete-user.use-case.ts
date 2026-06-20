import { UserId } from "@/backend/modules/shared";
import type { UserRepository } from "../../domain/repositories/user.repository";

export interface DeleteUserInput {
  userId: string;
}

export class DeleteUserUseCase {
  constructor(
    private readonly deps: {
      userRepo: UserRepository;
    }
  ) {}

  async execute(input: DeleteUserInput): Promise<void> {
    await this.deps.userRepo.delete(UserId.fromPrimitives(input.userId));
  }
}
