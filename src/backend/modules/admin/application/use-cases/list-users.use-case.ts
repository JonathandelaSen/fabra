import type { UserRepository } from "../../domain/repositories/user.repository";
import { UsersPage } from "../../domain/value-objects/users-page.value-object";

export const USERS_PER_PAGE = 20;

export interface ListUsersInput {
  search: string;
  page: number;
}

export class ListUsersUseCase {
  constructor(
    private readonly deps: {
      userRepo: UserRepository;
    }
  ) {}

  async execute(input: ListUsersInput): Promise<UsersPage> {
    const page = Math.max(1, input.page);
    const { users, total } = await this.deps.userRepo.search({
      search: input.search,
      page,
      perPage: USERS_PER_PAGE,
    });

    return UsersPage.fromPrimitives({
      users: users.map((u) => u.toPrimitives()),
      page,
      perPage: USERS_PER_PAGE,
      total,
    });
  }
}
