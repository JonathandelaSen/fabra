import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import { SupabaseUserRepository } from "./supabase-user.repository";

const repo = new SupabaseUserRepository();

describe("SupabaseUserRepository", () => {
  it("finds a user by partial email search and hydrates the entity", async () => {
    const user = await createTestUser("admin-dir-search");

    const result = await repo.search({
      search: user.email,
      page: 1,
      perPage: 20,
    });

    expect(result.total).toBe(1);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].toPrimitives()).toMatchObject({
      id: user.id,
      email: user.email,
    });
    expect(result.users[0].toPrimitives().createdAt).toBeTruthy();
  });

  it("paginates results beyond the requested page size", async () => {
    const prefix = `admin-dir-page-${Date.now()}`;
    const first = await createTestUser(`${prefix}-a`);
    const second = await createTestUser(`${prefix}-b`);

    const search = prefix;
    const pageOne = await repo.search({ search, page: 1, perPage: 1 });
    const pageTwo = await repo.search({ search, page: 2, perPage: 1 });

    expect(pageOne.total).toBe(2);
    expect(pageTwo.total).toBe(2);
    expect(pageOne.users).toHaveLength(1);
    expect(pageTwo.users).toHaveLength(1);
    const emails = [pageOne.users[0].email, pageTwo.users[0].email];
    expect(emails).toContain(first.email);
    expect(emails).toContain(second.email);
  });

  it("deletes a user and ensures they no longer appear in search results", async () => {
    const user = await createTestUser("admin-delete-test");

    const searchBefore = await repo.search({
      search: user.email,
      page: 1,
      perPage: 20,
    });
    expect(searchBefore.total).toBe(1);

    await repo.delete(user.id);

    const searchAfter = await repo.search({
      search: user.email,
      page: 1,
      perPage: 20,
    });
    expect(searchAfter.total).toBe(0);
  });
});

