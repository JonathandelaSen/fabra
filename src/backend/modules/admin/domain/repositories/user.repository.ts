import type { UserId } from "@/backend/modules/shared";
import type { User } from "../entities/user.entity";
import type { UserSearchResult } from "../value-objects/user-search-result.value-object";

export interface UserSearchCriteria {
  search: string;
  page: number;
  perPage: number;
}

export interface UserRepository {
  search(criteria: UserSearchCriteria): Promise<UserSearchResult>;
  delete(userId: UserId): Promise<void>;
}
