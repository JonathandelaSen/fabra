import { ValueObject, Counter } from "@/modules/shared";
import type { UserPrimitives } from "../entities/user.entity";
import { User } from "../entities/user.entity";

export interface UserSearchResultPrimitives {
  users: UserPrimitives[];
  total: number;
}

export class UserSearchResult extends ValueObject<UserSearchResultPrimitives> {
  private constructor(
    private readonly usersList: readonly User[],
    private readonly totalCount: Counter
  ) {
    super();
  }

  static create(users: readonly User[], total: number): UserSearchResult {
    return new UserSearchResult(users, Counter.fromPrimitives(total));
  }

  static fromPrimitives(primitives: UserSearchResultPrimitives): UserSearchResult {
    return new UserSearchResult(
      primitives.users.map((u) => User.fromPrimitives(u)),
      Counter.fromPrimitives(primitives.total)
    );
  }

  toPrimitives(): UserSearchResultPrimitives {
    return {
      users: this.usersList.map((u) => u.toPrimitives()),
      total: this.totalCount.toPrimitives(),
    };
  }

  get users(): readonly User[] {
    return this.usersList;
  }

  get total(): number {
    return this.totalCount.toPrimitives();
  }
}
