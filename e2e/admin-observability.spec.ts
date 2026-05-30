import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import {
  createConfirmedUser,
  createProcessingEvent,
  grantAdminAccess,
} from "./helpers/supabase";
import { messages } from "../src/i18n/messages";

test("admin user can open observability dashboard and filter events", async ({
  page,
}) => {
  const user = await createConfirmedUser("admin-observability");
  await grantAdminAccess(user.id);
  await createProcessingEvent({
    userId: user.id,
    requestId: "e2e-admin-observability-request",
    stage: "ai_analysis",
    status: "success",
  });

  await loginViaUI(page, user);
  await page.goto("/admin");

  await expect(
    page.getByRole("heading", { name: messages.en.admin.title }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /success .* ai_analysis e2e .* e2e-admin-observability-request/,
    }),
  ).toBeVisible();

  await page.locator("select").first().selectOption("success");
  await expect(page).toHaveURL("/admin?status=success");
  await expect(
    page.getByText("e2e-admin-observability-request", { exact: true }),
  ).toBeVisible();
});

test("non-admin user is redirected away from observability dashboard", async ({
  page,
}) => {
  const user = await createConfirmedUser("admin-observability-user");

  await loginViaUI(page, user);
  await page.goto("/admin");

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: messages.en.admin.title }),
  ).toBeHidden();
});
