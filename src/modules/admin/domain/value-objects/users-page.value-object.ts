import { ValueObject, Counter } from "@/modules/shared";
import type { UserPrimitives } from "../entities/user.entity";
import { User } from "../entities/user.entity";

export interface UsersPagePrimitives {
  users: UserPrimitives[];
  page: number;
  perPage: number;
  total: number;
}

export class UsersPage extends ValueObject<UsersPagePrimitives> {
  private constructor(
    private readonly usersList: readonly User[],
    private readonly pageNumber: Counter,
    private readonly perPageCount: Counter,
    private readonly totalCount: Counter
  ) {
    super();
  }

  static fromPrimitives(primitives: UsersPagePrimitives): UsersPage {
    return new UsersPage(
      primitives.users.map((u) => User.fromPrimitives(u)),
      Counter.fromPrimitives(primitives.page),
      Counter.fromPrimitives(primitives.perPage),
      Counter.fromPrimitives(primitives.total)
    );
  }

  toPrimitives(): UsersPagePrimitives {
    return {
      users: this.usersList.map((u) => u.toPrimitives()),
      page: this.pageNumber.toPrimitives(),
      perPage: this.perPageCount.toPrimitives(),
      total: this.totalCount.toPrimitives(),
    };
  }

  get users(): readonly User[] {
    return this.usersList;
  }

  get page(): number {
    return this.pageNumber.toPrimitives();
  }

  get perPage(): number {
    return this.perPageCount.toPrimitives();
  }

  get total(): number {
    return this.totalCount.toPrimitives();
  }
}
