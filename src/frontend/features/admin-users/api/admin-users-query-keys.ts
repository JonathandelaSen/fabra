export interface AdminUsersFilters {
  search: string;
  page: number;
}

export const adminUsersQueryKeys = {
  all: ["admin-users"] as const,
  list: (filters: AdminUsersFilters) =>
    [...adminUsersQueryKeys.all, "list", filters.search, filters.page] as const,
};
