"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminUsers } from "../api/admin-users-api";
import {
  adminUsersQueryKeys,
  type AdminUsersFilters,
} from "../api/admin-users-query-keys";

export function useAdminUsersQuery(filters: AdminUsersFilters) {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(filters),
    queryFn: () => listAdminUsers(filters),
  });
}
