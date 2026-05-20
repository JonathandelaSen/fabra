import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";
import { messages } from "../src/i18n/messages";

test("authenticated user can open settings and manage local AI preferences", async ({
  page,
}) => {
  const user = await createConfirmedUser("settings");
  await loginViaUI(page, user);

  await page.goto("/settings");
  await expect(page).toHaveURL(/\/settings$/);
  await expect(
    page.getByRole("heading", { name: messages.en.settings.title }),
  ).toBeVisible();

  const apiKeyInput = page.getByPlaceholder(
    messages.en.settings.apiKey.placeholder,
  );
  await apiKeyInput.fill("settings-e2e-api-key");
  await page
    .getByRole("button", { name: messages.en.common.actions.save })
    .click();
  await expect(
    page.getByText(messages.en.common.actions.saved),
  ).toBeVisible();

  await page.goto("/");
  await page
    .getByRole("button", { name: messages.en.navigation.settings })
    .click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(apiKeyInput).toHaveValue("settings-e2e-api-key");
});
