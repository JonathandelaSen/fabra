"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminUser } from "../api/admin-users-api";
import { adminUsersQueryKeys } from "../api/admin-users-query-keys";

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminUsersQueryKeys.all,
      });
    },
  });
}
