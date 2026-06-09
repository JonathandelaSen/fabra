import type { User } from "../../domain/entities/user.entity";
import type { UserRepository } from "../../domain/repositories/user.repository";

export const USERS_PER_PAGE = 20;

export interface ListUsersInput {
  search: string;
  page: number;
}

export interface ListUsersResult {
  users: User[];
  page: number;
  perPage: number;
  total: number;
}

export class ListUsersUseCase {
  constructor(
    private readonly deps: {
      userRepo: UserRepository;
    }
  ) {}

  async execute(input: ListUsersInput): Promise<ListUsersResult> {
    const page = Math.max(1, input.page);
    const { users, total } = await this.deps.userRepo.search({
      search: input.search,
      page,
      perPage: USERS_PER_PAGE,
    });

    return { users, page, perPage: USERS_PER_PAGE, total };
  }
}
