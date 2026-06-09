import type { User } from "../entities/user.entity";

export interface UserSearchCriteria {
  search: string;
  page: number;
  perPage: number;
}

export interface UserSearchResult {
  users: User[];
  total: number;
}

export interface UserRepository {
  search(criteria: UserSearchCriteria): Promise<UserSearchResult>;
}
