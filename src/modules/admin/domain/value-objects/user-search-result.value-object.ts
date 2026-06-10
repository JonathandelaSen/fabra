import { ValueObject } from "@/modules/shared";
import type { User } from "../entities/user.entity";

export interface UserSearchResultPrimitives {
  users: User[];
  total: number;
}

export class UserSearchResult extends ValueObject<UserSearchResultPrimitives> {
  private constructor(public readonly users: User[], public readonly total: number) {
    super();
  }

  static fromPrimitives(primitives: UserSearchResultPrimitives): UserSearchResult {
    return new UserSearchResult(primitives.users, primitives.total);
  }

  toPrimitives(): UserSearchResultPrimitives {
    return {
      users: this.users,
      total: this.total,
    };
  }
}
