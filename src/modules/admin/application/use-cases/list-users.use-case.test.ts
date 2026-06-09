import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import { SupabaseUserRepository } from "../../infrastructure/repositories/supabase-user.repository";
import { ListUsersUseCase, USERS_PER_PAGE } from "./list-users.use-case";

const useCase = new ListUsersUseCase({
  userRepo: new SupabaseUserRepository(),
});

describe("ListUsersUseCase", () => {
  it("returns the matching page with pagination metadata", async () => {
    const user = await createTestUser("admin-list-uc");

    const result = await useCase.execute({ search: user.email, page: 1 });

    expect(result).toMatchObject({
      page: 1,
      perPage: USERS_PER_PAGE,
      total: 1,
    });
    expect(result.users).toHaveLength(1);
    expect(result.users[0].email).toBe(user.email);
  });

  it("normalizes pages below 1 to the first page", async () => {
    const user = await createTestUser("admin-list-uc-page");

    const result = await useCase.execute({ search: user.email, page: 0 });

    expect(result.page).toBe(1);
    expect(result.users).toHaveLength(1);
  });
});
